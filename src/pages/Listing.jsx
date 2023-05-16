import React, { useEffect, useMemo, useState } from 'react'
import ReactFlagsSelect from "react-flags-select";
import { Us } from "react-flags-select";
import SingleList from '../components/listings/SingleList';
import { useQuery } from '@tanstack/react-query'
import axios from '../api/axios';
import useAuth from '../hooks/useAuth';
import { getCountryInfoByISO } from '../utils/iso-country-currency';
import { ColorRing } from 'react-loader-spinner';
import { io } from 'socket.io-client'
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

const Listing = () => {
    const navigate = useNavigate()
    const [selected, setSelected] = useState('SE');
    const [appliedFilters, setAppliedFilters] = useState(['country']);
    const [searchInput, setSearchInput] = useState('');
    const [moreFilters, setMoreFilters] = useState(false)
    const [filteredData, setFilteredData] = useState([])
    const [brand, setBrand] = useState('')
    const [condition, setCondition] = useState('')
    const [range, setRange] = useState('')
    const [data, setData] = useState([])
    const [added, setAdded] = useState(false)
    const [added2, setAdded2] = useState(false)
    const [added3, setAdded3] = useState(false)
    const { auth } = useAuth();
    const userCurrency = "SEK";
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    //array contains unique key that this query represents i.e cahching,refectching,etc
    const [socket, setSocket] = useState(null);
    const { isLoading: isLoadingListings, isRefetching: isRefectingListings, data: listingsData, refetch: listingsRefetch } = useQuery(
        ['listings', { userCurrency }],
        async () => {
            const response = await axios.get(`/disc/allUsersDiscs`);
            setData(response.data)
            applyFilters(appliedFilters)
            return response.data;
        },
        { refetchOnWindowFocus: Infinity }
    );
    let followingDataQuery;
    let followingData;

    useEffect(() => {
        const newSocket = io('https://fleadisc.herokuapp.com');
        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('bid_added', () => {
                listingsRefetch();
            });
        }
    }, [socket, listingsRefetch]);

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (Object.keys(auth).length !== 0) {
        followingDataQuery = useMemo(
            () => ['following', { userId: auth.userId }],
            [auth.userId]
        );
        ({
            data: followingData,
        } = useQuery(
            followingDataQuery,
            async () => {
                const response = await axios.get(`/user/following/${auth.userId}`);
                return response.data;
            },
        ));
    }

    const applyFilters = (appliedFilters2) => {
        let tempDiscs
        if (searchInput !== '') {
            tempDiscs = filteredData
        }
        else {
            tempDiscs = listingsData;
        }
        if (appliedFilters2.length > 0) {
            tempDiscs = tempDiscs?.map((disc) => {
                const filteredDiscs = disc?.discs?.filter((d) => {
                    return appliedFilters2?.every((filter) => {
                        if (filter === "shortOnTime") {
                            const endDateTime = moment(`${d.endDay} ${d.endTime}`, "YYYY-MM-DD HH:mm");
                            const twoHoursFromNow = moment().add(10, "hours");
                            return endDateTime.isBefore(twoHoursFromNow);
                        }
                        if (filter === "following") {
                            if (Object.keys(auth).length !== 0) {
                                return followingData.some((f) => f.disc === d._id)
                            }
                            else {
                                navigate('/login')
                            }
                        }
                        if (filter === "new") {
                            const createdAt = moment(d.createdAt);
                            const now = moment();
                            const diffInHours = now.diff(createdAt, 'hours');
                            if (diffInHours < 12) {
                                return true;
                            }
                        }
                        if (filter === "unamed") {
                            return !d.named;
                        }
                        if (filter === "brand") {
                            return d.brand === brand;
                        }
                        if (filter === "condition") {
                            return d.condition === Number(condition);
                        }
                        if (filter === "range") {
                            return d.range === range
                        }
                        if (filter === "country") {
                            return d.seller.country === selected
                        }
                        if (filter === "popular") {
                            return d.bids.length > 5;
                        }
                        return d[filter];
                    });
                });
                return {
                    ...disc,
                    discs: filteredDiscs,
                };
            });
            tempDiscs = tempDiscs?.filter((disc) => disc.discs.length > 0);
            setData(tempDiscs);
        } else {
            if (searchInput !== '') {
                setData(filteredData)
            }
            else
                setData(listingsData);
        }
    };

    useEffect(() => {
        if (listingsData) {
            applyFilters(appliedFilters);
        }
    }, [listingsData, appliedFilters]);

    useEffect(() => {
        applyFilters(appliedFilters);
    }, [brand, condition, appliedFilters, selected]);

    const handleBrand = (e) => {
        setBrand(e.target.value)
        if (e.target.value === 'brand') {
            setAdded(false)
            handleFilterClick('brand')
        }
        else
            if (!added) {
                handleFilterClick('brand')
                applyFilters(appliedFilters)
                setAdded(true)
            }
            else {
                applyFilters(appliedFilters)
            }
    }

    const handleCondition = (e) => {
        setCondition(e.target.value)
        if (e.target.value === 'condition') {
            setAdded2(false)
            handleFilterClick('condition')
        }
        else
            if (!added2) {
                handleFilterClick('condition')
                applyFilters(appliedFilters)
                setAdded2(true)
            }
            else {
                applyFilters(appliedFilters)
            }
    }

    const handleRange = (e) => {
        setRange(e.target.value)
        if (e.target.value === 'range') {
            setAdded3(false)
            handleFilterClick('range')
        }
        else
            if (!added3) {
                handleFilterClick('range')
                applyFilters(appliedFilters)
                setAdded3(true)
            }
            else {
                applyFilters(appliedFilters)
            }
    }

    const handleSearchInputChange = (e) => {
        const inputValue = e.target.value.toLowerCase(); // Convert input value to lowercase for case-insensitive search
        setSearchInput(e.target.value); // Update the searchInput state with the input value
        const filteredArray = listingsData.map((value) => {
            const discMatchesSearch = value.discs.filter((disc) => {
                return Object.values(disc).some((property, index) => {
                    return (
                        property !== null &&
                        typeof property === 'string' && Object.keys(disc)[index] !== "pictureURL" &&
                        property.toLowerCase().includes(inputValue)
                    );
                });
            });
            return { ...value, discs: discMatchesSearch };
        });
        let filteredArray2 = filteredArray.filter((disc) => disc.discs.length > 0);
        setFilteredData(filteredArray2)
        setData(filteredArray2)
    };

    const handleFilterClick = (filter) => {
        let tempFilters = [...appliedFilters];

        if (tempFilters.includes(filter)) {
            tempFilters = tempFilters.filter(f => f !== filter);
        } else {
            tempFilters.push(filter);
        }
        setAppliedFilters(tempFilters);
        applyFilters(tempFilters)
    }

    const handleCountry = (country) => {
        setSelected(country)
    }

    return (
        <div className=' w-full m-auto text-[1.2rem] sm:text-[1rem] xsm:text-[1rem]'>
            <div className='listingBackgroundImage flex justify-center h-[35vw] min-h-[135px] max-h-[300px] bg-[rgba(0,0,0,0.1)] relative'>
                <h1 className='text-[35px] sm:text-[20px] xsm:text-[20px] w-[80%] md:text-[30px] text-[white] font-logo text-center relative z-10 sm:mt-[30px] my-auto xsm:mt-[30px]'>Disc-over your game with pre-loved gear</h1>
                <input
                    style={{ boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)' }}
                    className='border-[1px] w-[64.10vw] max-w-[500px] min-w-[250px] border-[#81B29A] absolute bottom-[-24px] bg-[white] z-10 h-[47px] rounded-lg px-[14px] font-sans'
                    type='text'
                    placeholder='Search...'
                    value={searchInput}
                    onChange={handleSearchInputChange}
                />
            </div>
            <div className='mt-[45px] xsm:mt-[35px] sm:mt-[35px] xsm:mb-[5px] sm:mb-[5px] mb-[10px] px-[5px] xsm:px-0 flex gap-[10px] xsm:gap-[5px] items-center xsm:justify-start  justify-center  xsm:w-[310px] w-full m-auto '>
                <div className='pl-[4px] xsm:border-[0px] border-[1px] rounded-[2px] h-[27px] flex items-center '>
                    <ReactFlagsSelect
                        selected={selected}
                        fullWidth={true}
                        searchable={true}
                        alignOptionsToRight={true}
                        onSelect={(code) => { handleCountry(code) }}
                        className='min-w-[125px] xsm:min-w-[0px] text-text  font-sans'
                        placeholder=""
                        showSelectedLabel={screenSize.width > 576 ? true : false}
                        showOptionLabel={true}
                    />
                </div>
                <select onChange={handleRange} defaultValue='range' className='outline-none w-[74px] text-[#1E1E21] text-center border-[1px] border-[#000000] text-[.7em] leading-[14.63px] h-[27px] rounded-[2px] bg-[white]'>
                    <option value='range'>Range</option>
                    <option value='Putt & Approach'>Putt & Approach</option>
                    <option value='Midrange'>Midrange</option>
                    <option value='Fairway drivers'>Fairway drivers</option>
                    <option value='Distance Drivers'>Distance Drivers</option>
                </select>
                <select onChange={handleBrand} defaultValue='brand' className='outline-none w-[76px]  text-[#1E1E21] text-center border-[1px] border-[#000000] text-[.7em] leading-[14.63px] h-[27px] rounded-[2px] bg-[white]'>
                    <option value='brand'>Brand</option>
                    <option value='Aerobie'>Aerobie</option>
                    <option value='Alfa Discs'>Alfa Discs</option>
                    <option value='Axiom Discs'>Axiom Discs</option>
                    <option value='Bushnell'>Bushnell</option>
                    <option value='Clash Discs'>Clash Discs</option>
                    <option value='DGA'>DGA</option>
                    <option value='DiscGolf Pins'>DiscGolf Pins</option>
                    <option value='DiscGolfPark'>DiscGolfPark</option>
                    <option value='Discmania'>Discmania</option>
                    <option value='Discraft'>Discraft</option>
                    <option value='Discsport'>Discsport</option>
                    <option value='Dynamic Discs'>Dynamic Discs</option>
                    <option value='E-RaY'>E-RaY</option>
                    <option value='European Birdies'>European Birdies</option>
                    <option value='EV-7'>EV-7</option>
                    <option value='Fossa'>Fossa</option>
                    <option value='Galaxy Discs'>Galaxy Discs</option>
                    <option value='Gateway'>Gateway</option>
                    <option value='Grip Eq'>Grip Eq</option>
                    <option value='Hero Disc'>Hero Disc</option>
                    <option value='Innova'>Innova</option>
                    <option value='Jacquard'>Jacquard</option>
                    <option value='Kastaplast'>Kastaplast</option>
                    <option value='Keen'>Keen</option>
                    <option value='KnA games'>KnA games</option>
                    <option value='Latitude 64'>Latitude 64</option>
                    <option value='Launch Discs'>Launch Discs</option>
                    <option value='Legacy Discs'>Legacy Discs</option>
                    <option value='Løft Discs (loft)'>Løft Discs (loft)</option>
                    <option value='Millennium'>Millennium</option>
                    <option value='Momentum SE'>Momentum SE</option>
                    <option value='MVP Discs'>MVP Discs</option>
                    <option value='Oak Socks'>Oak Socks</option>
                    <option value='Prodigy'>Prodigy</option>
                    <option value='Prodiscus'>Prodiscus</option>
                    <option value='PUG Förlag'>PUG Förlag</option>
                    <option value='Streamline Discs'>Streamline Discs</option>
                    <option value='Swedisc'>Swedisc</option>
                    <option value='Ugglan'>Ugglan</option>
                    <option value='Westside'>Westside</option>
                    <option value='Wham-O'>Wham-O</option>
                    <option value='Other'>Other</option>
                </select>
                <select defaultValue='condition' onChange={handleCondition} className='outline-none w-[92px] text-[#1E1E21] text-center border-[1px] border-[#000000] text-[.7em] leading-[14.63px] h-[27px] rounded-[2px] bg-[white]'>
                    <option value='condition'>Condition</option>
                    <option value='1'>1</option>
                    <option value='2'>2</option>
                    <option value='3'>3</option>
                    <option value='4'>4</option>
                    <option value='5'>5</option>
                    <option value='6'>6</option>
                    <option value='7'>7</option>
                    <option value='8'>8</option>
                    <option value='9'>9</option>
                    <option value='10'>10</option>
                    <option value='11'>11</option>
                </select>
            </div>
            <div className='px-[5px] xsm:px-0 flex gap-[10px] xsm:gap-[5px] items-center xsm:justify-start justify-center flex-wrap xsm:w-[320px] w-[405px]  m-auto'>
                <button className={`w-[57px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('new') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('new')}>New</button>
                <button className={`w-[66px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('popular') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('popular')}>Popular</button>
                <button className={`w-[77px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('following') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('following')}>Following</button>
                <button className={`w-[99px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('shortOnTime') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('shortOnTime')}>Short on time</button>
                {moreFilters && <>
                    <button className={`w-[74px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('named') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('named')}>Named</button>
                    <button className={`w-[79px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('unamed') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('unamed')}>Unamed</button>
                    <button className={`w-[50px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('dyed') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('dyed')}>Dyed</button>
                    <button className={`w-[87px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('collectible') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('collectible')}>Collectible</button>
                    <button className={`w-[59px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('blank') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('blank')}>Blank</button>
                    <button className={`w-[68px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('firstRun') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('firstRun')}>First Run</button>
                    <button className={`w-[51px] h-[27px] rounded-[6px] font-sans text-[0.7em] leading-[15px] text-[#1E1E21] font-medium hover:text-[black] border-[1px] hover:border-[#81B29A] hover:bg-[#81B29A33] ${appliedFilters.includes('glow') ? "border-[#81B29A] bg-[#81B29A33]" : ""}`} onClick={() => handleFilterClick('glow')} >Glow</button>
                </>}
            </div>
            <div className='flex justify-start xsm:w-[320px] w-[405px] m-auto'>
                <div className='flex justify-start'>
                    <p onClick={() => setMoreFilters((prev) => !prev)} className='text-[0.75em] text-[#595959] mt-[10px] hover:underline cursor-pointer'>{moreFilters ? 'Close more filters' : 'Show more filters'}</p>
                </div>
            </div>
            {(isLoadingListings) ? (
                <div style={{ position: "relative", minHeight: "200px" }}>
                    <Loader />
                </div>
            ) : (
                <div className='flex flex-col xsm:w-full sm:w-full w-[90%] m-auto overflow-hidden mb-[50px]'>
                    {listingsData?.length === 0 ?
                        <p className='mt-[20px] text-[1em] min-h-[30vh] flex items-center justify-center font-[500] text-center text-[#0000006f]'>No discs found</p>
                        :
                        listingsData?.length > 0 ?
                            (appliedFilters.length > 0 || searchInput !== '') ?
                                data?.length === 0
                                    ? <p className='mt-[20px] text-[1em] min-h-[30vh] flex items-center justify-center font-[500] text-center text-[#0000006f]'>No discs found</p>
                                    : data?.map((value, index) => {
                                        return (
                                            <React.Fragment key={index}>
                                                <SingleList value={value} discs={value.discs} index={index} />
                                            </React.Fragment>
                                        )
                                    })
                                :
                                listingsData?.map((value, index) => {
                                    return (
                                        <React.Fragment key={index}>
                                            <SingleList value={value} discs={value.discs} index={index} />
                                        </React.Fragment>
                                    )
                                })
                            :
                            <p className='mt-[20px] text-[1em] min-h-[30vh] flex items-center justify-center font-[500] text-center text-[#0000006f]'>No discs found</p>
                    }
                </div>
            )}
        </div >
    )
}

export default Listing