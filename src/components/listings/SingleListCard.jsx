import moment from 'moment'
import React, { useEffect, useState, useMemo } from 'react'
import blank from '../../assets/blank.svg'
import collectible from '../../assets/collectible.svg'
import dyed from '../../assets/dyed.svg'
import firstRun from '../../assets/firstRun.svg'
import glow from '../../assets/glow.svg'
import grams from '../../assets/grams.svg'
import named from '../../assets/named.svg'
import plastic from '../../assets/plastic.svg'
import ConfirmBid from './ConfirmBid'
import OlderBids from './OlderBids'
import useAuth from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { getCountryInfoByISO } from '../../utils/iso-country-currency'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../../api/axios'
import { FaSpinner } from 'react-icons/fa'

const SingleListCard = ({ val, seller }) => {
    const { auth } = useAuth();
    const [extra, setExtra] = useState(false)
    const [imageModal, setImageModal] = useState(false);
    const [modal, setModal] = useState(false)
    const [error, setError] = useState(false)
    const [errorText, setErrorText] = useState('')
    const [oldModal, setOldModal] = useState(false)
    const [price, setPrice] = useState("")
    const [type, setType] = useState(null)
    const [remainingTime, setRemainingTime] = useState(getRemainingTime(val.endDay, val.endTime));
    const [currentTime, setCurrentTime] = useState("")
    const [currentId, setCurrentId] = useState(0)
    const navigate = useNavigate();
    const userCurrency = "SEK";
    let followingDataQuery;
    let isRefetchingFollowing;
    let followingData;
    let followingRefetch;
    const clearForm = () => {
        setPrice("")
        setType(null)
    }
    const modalComponent = useMemo(() => <ConfirmBid price={price} val={val} seller={seller} type={type} setModel={setModal} currentTime={currentTime} clearForm={clearForm} />, [price, val, type, currentTime, setModal]);
    const oldModalComponent = useMemo(() => <OlderBids setModel={setOldModal} discId={val._id} />, [setOldModal]);
    if (Object.keys(auth).length !== 0) {
        followingDataQuery = useMemo(
            () => ['following', { userId: auth.userId }],
            [auth.userId]
        );
        ({
            isFetching: isRefetchingFollowing,
            data: followingData,
            refetch: followingRefetch
        } = useQuery(
            followingDataQuery,
            async () => {
                const response = await axios.get(`/user/following/${auth.userId}`);
                setCurrentId(0)
                return response.data;
            },
            {
                staleTime: 60000000000 // Set stale time to 1 minute
            }
        ));
    }

    const { mutate: followMutation, isLoading: isFollowLoading } = useMutation(
        () => axios.post('/user/following', { userId: auth.userId, discId: val._id }),
        {
            onSuccess: () => {
                followingRefetch();
            },
        }
    );

    const { mutate: unfollowMutation, isLoading: isUnfollowLoading } = useMutation(
        () => axios.delete(`/user/following/${auth.userId}/${val._id}`),
        {
            onSuccess: () => {
                followingRefetch();
            },
        }
    );

    const handleFollowClick = (e) => {
        e.stopPropagation()
        if (Object.keys(auth).length === 0) {
            navigate('/signin')
            return
        }
        setCurrentId(val._id)
        if (isFollowing(val._id, followingData)) {
            unfollowMutation();
        } else {
            followMutation();
        }
    };

    const isFollowing = (itemId, followingData) => {
        return followingData?.some((item) => item.disc === itemId);
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setRemainingTime(getRemainingTime(val.endDay, val.endTime));
        }, 100);
        return () => clearInterval(intervalId);
    }, [val.endDay, val.endTime]);

    function getRemainingTime(endDay, endTime) {
        const endDateTime = moment(`${endDay} ${endTime}`);
        const now = moment();
        const diff = endDateTime.diff(now);
        const duration = moment.duration(diff);
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        let remainingTime;
        if (years > 0) {
            remainingTime = `${years} ${years === 1 ? 'year' : 'years'}`;
        } else if (months > 0) {
            remainingTime = `${months} ${months === 1 ? 'month' : 'months'}`;
        } else if (days > 0) {
            remainingTime = `${days} ${days === 1 ? 'day' : 'days'} ${hours}h`;
        } else if (hours > 0) {
            remainingTime = `${hours}h ${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
        } else if (minutes > 0) {
            remainingTime = `${minutes} ${minutes === 1 ? 'min' : 'mins'}`;
            if (seconds > 0) {
                remainingTime += ` ${seconds} s`;
            }
        } else {
            remainingTime = `${seconds} s`;
        }

        return remainingTime;
    }

    function getMonthAndDate(dateString) {
        const date = moment(dateString);
        const monthName = date.format("MMM");
        const dayOfMonth = date.format("D");
        return `${dayOfMonth} ${monthName}`;
    }

    const handleBid = (e, type) => {
        e.preventDefault()
        if (type === 'bid') {
            if (price === null || price === '') {
                setError(true)
                setErrorText('Please enter a price')
                return
            }
            if (val.bids.length > 0) {
                if (price < Number(val.highestBid.bidPrice) + Number(val.minPrice)) {
                    setError(true)
                    setErrorText('Enter higher price than min')
                    return
                }
            }
            else {
                if (price < Number(val.minPrice) + Number(val.startingPrice)) {
                    setError(true)
                    setErrorText('Enter higher price than min')
                    return
                }
            }
        }
        setError(false)
        type === 'bid' ? setType('bid') : setType('buy')
        setCurrentTime(new Date().toLocaleString())
        setModal(true)
    }
    let highestBid

    if (val.bids.length > 0) {
        highestBid = val.bids.sort(
            (a, b) => b.bidPrice - a.bidPrice
        )[0];
    }

    return (
        <div className={`flex relative mb-[10px] xsm:text-[1.07rem] sm:text-[1.07rem] text-[1.2rem] pb-[8px] card rounded-[8px] bg-[#ffffff] flex-wrap xsm:min-w-[170px] xsm:max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px] h-[0%] flex-col`}>
            <div className='flex rounded-t-[8px] xsm:h-[170px] sm:h-[170px] md:h-[200px] lg:h-[210px] xsm:min-w-[170px] xsm:max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:h-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px] 2xl:h-[240px] hover:bg-[#000000fb] justify-center'><img src={val.pictureURL} className=' hover:opacity-[0.8] xsm:h-[170px] rounded-t-[8px] sm:h-[170px] md:h-[200px] lg:h-[210px] xsm:min-w-[170px] xsm:max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:h-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px] 2xl:h-[240px] cursor-pointer' alt="Disc Image" onClick={() => setImageModal(true)} /></div>
            <div onClick={() => setExtra(prev => !prev)} className='flex justify-between cursor-pointer px-[0.625em] pt-[0.425em]'>
                <div className='flex flex-col justify-between'>
                    <div className='flex flex-col items-start'>
                        <div className='flex  relative justify-start '>
                            <h1 className='text-[0.75em] font-[700]' >{val.discName}</h1>
                            <span className='px-[0.5em] mt-[2px] absolute right-[-20px] top-[-1px]  ml-[-5px] text-[0.563em] border-[1px] rounded-full border-[#595959]'>{val.condition}</span>
                        </div>
                        <h1 className='text-[0.55em] font-[500] min-h-[20.81px] inline leading-[11px] text-[##595959]'>{val.brand}</h1>
                    </div>
                    {val.priceType === 'auction' && <div className='flex mt-[2px] flex-col text-[#595959]'>
                        <span className='font-[600] text-[0.6em]'>{getMonthAndDate(val.endDay)} - {val.endTime} </span>
                        <span className='font-[500] text-[#595959BF] text-[0.55em]'>{remainingTime}</span>
                    </div>}
                </div>
                <div className='flex flex-col justify-between items-end  gap-[21px]'>
                    <button disabled={isFollowLoading || isUnfollowLoading || isRefetchingFollowing} onClick={handleFollowClick} className={`text-[0.60em] relative xsm:min-h-[20px] sm:min-h-[20px] min-h-[22px] xsm:w-[50px] sm:w-[50px] w-[80px] px-[0.4375em] py-[0.125em] border-[#595959] border-[1px] rounded-[6px] mr-[-3px] mt-[1px] ${followingData?.some((item) => item.disc === val._id) ? "bg-[#81B29A33] border-[#81B29A] xsm:w-[60px] sm:w-[60x] w-[90px] px-[0em]" : ""}`}>
                        {(isFollowLoading || isUnfollowLoading || isRefetchingFollowing && currentId === val._id) ?
                            <FaSpinner
                                className="animate-spin absolute inset-0 m-auto"
                                style={{ width: "1em", height: "1em" }}
                            />
                            : (followingData?.some((item) => item.disc === val._id) ? "Following" : "Follow")}
                    </button>

                    <div className='flex flex-col items-end '>
                        {(val?.priceType === 'auction' && val.bids.length > 0) && <span className='text-[0.65em] mb-[-3px] text-end flex items-end font-[600]'>{highestBid.bidPrice} {userCurrency}</span>}
                        {(val?.priceType === 'auction' && val.bids.length === 0) && <span className='text-[0.65em] mb-[-3px] text-end flex items-end font-[600]'>{val.startingPrice} {userCurrency}</span>}
                        {val?.priceType === 'fixedPrice' && <span className='text-[0.65em] mb-[-3px] text-end flex items-end font-[600] '>{val.startingPrice} {userCurrency}</span>}
                        {val.priceType === 'fixedPrice' && <span className='text-[0.6em] font-[500]  text-end text-[#595959bf] '>Fixed price</span>}
                        {(val.priceType !== 'fixedPrice') &&
                            <div className='flex items-center text-[1em]'>
                                <p onClick={(e) => {
                                    if (val.bids.length === 0) {
                                        e.stopPropagation()
                                        return
                                    }
                                    setOldModal(true); e.stopPropagation();
                                }} className='text-[0.6em] cursor-pointer hover:underline hover:text-text font-[500] text-[#595959BF] '>{val.bids.length} Bids</p>
                            </div>}
                    </div>
                </div>
            </div>
            {extra && <> <div className='mt-[10px] text-[1.3rem] xsm:text-[1rem] sm:text-[1rem] px-[0.625em]'>
                <div className='flex w-full mb-[5px] justify-between gap-[5px] flex-wrap'>
                    {val.plastic !== '' &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={plastic} alt="" className=" w-[0.8125em]" />
                            <p className='text-[0.6em] font-[300]'>{val.plastic}</p>
                        </div>
                    }
                    {val.grams !== '' &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={grams} alt="" className=" w-[0.75em]" />
                            <p className='text-[0.6em] font-[300]'>{val.grams}</p>
                        </div>
                    }
                    {val.named !== false &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={named} alt="" className=" w-[0.625em]" />
                            <p className='text-[0.6em] font-[300]'>Named</p>
                        </div>
                    }
                    {val.dyed !== false &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={dyed} alt="" className=" w-[0.6875em]" />
                            <p className='text-[0.6em] font-[300]'>Dyed</p>
                        </div>
                    }
                    {val.blank !== false &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={blank} alt="" className={` w-[0.625em] ${extra ? "mt-[-0.0625em]" : ""} `} />
                            <p className='text-[0.6em] font-[300]'>Blank</p>
                        </div>
                    }
                    {val.glow !== false &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={glow} alt="" className=" w-[0.75em]" />
                            <p className='text-[0.6em] font-[300]'>Glow</p>
                        </div>
                    }
                    {val.firstRun !== false &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={firstRun} alt="" className=" w-[0.625em]" />
                            <p className='text-[0.6em] font-[300]'>Run</p>
                        </div>
                    }
                    {val.collectible !== false &&
                        <div className='flex items-center gap-[3px]'>
                            <img src={collectible} alt="" className=" w-[0.6875em]" />
                            <p className='text-[0.6em] font-[300]'>Collectible</p>
                        </div>
                    }
                </div>
                {val.priceType === 'auction' &&
                    <form onSubmit={(e) => handleBid(e, 'bid')} className='flex flex-col mb-[6px] gap-[6px]'>
                        <p className='text-[0.55em] text-[#595959] py-[2px] font-[400]'>Buyer pays shipping from <span className='font-[700]'>{seller?.city !== undefined ? seller.city + ", " : ""}{getCountryInfoByISO(seller?.country).countryName}</span></p>
                        {Object.keys(auth).length !== 0 && <input value={price} min={0} onChange={(e) => {
                            setPrice(e.target.value);
                            if (Number(e.target.value >= val.minPrice))
                                setError(false)
                            if (e.target.value && errorText === 'Please enter a price') {
                                setErrorText('')
                                setError(false)
                            }
                            if (e.target.value && errorText === 'Enter higher price than min') {
                                setErrorText('')
                                setError(false)
                            }
                        }} type="number" className={`w-full pl-[3px] py-[0.25em] rounded-[2px] text-[.65em] border-[1px] ${error ? "border-[#f21616]" : "border-[#000000]"}`} placeholder={`Min - ${val.highestBid?.bidPrice ? `${Number(val.highestBid.bidPrice.toFixed(0)) + Number(val.minPrice.toFixed(0))} ` : `${Number(val.startingPrice.toFixed(0)) + Number(val.minPrice.toFixed(0))}`} ${userCurrency}`} />}
                        {error && <p className='text-[0.5em] text-[#eb0000] my-[-5px]'>{errorText}</p>}
                        {Object.keys(auth).length !== 0 ? <button type='submit' className='py-[0.25em] w-full rounded-[2px] text-[.75em] bg-primary font-[600] text-[#ffffff] button'>{"Place Bid"}</button> : <button onClick={() => { navigate('/signin') }} className='py-[0.25em] w-full rounded-[2px] text-[.75em] bg-primary font-[600] text-[#ffffff] button'>Sign in to bid</button>}
                    </form>}
                {(val.priceType === 'fixedPrice') &&
                    <div className='flex mb-[5px] flex-col gap-[5px] mt-[5px]'>
                        <p className='text-[0.55em] text-[#595959] py-[3px] font-[400]'>Buyer pays shipping from <span className='font-[700]'>{seller?.city !== undefined ? seller.city + ", " : ""}{getCountryInfoByISO(seller.country).countryName}</span></p>
                        {(Object.keys(auth).length !== 0) ?
                            <button onClick={(e) => { handleBid(e, 'buy') }} className='py-[0.25em] w-full rounded-[2px] text-[.75em] bg-primary font-[600] text-[#ffffff] button'>Buy</button> :
                            <button onClick={() => { navigate('/signin') }} className='py-[0.25em] w-full rounded-[2px] text-[.75em] bg-primary font-[600] text-[#ffffff] button'>Sign in to buy</button>}
                    </div>
                }
            </div>
            </>
            }
            {imageModal && (
                <>
                    <div className='modalBackground' onClick={() => setImageModal(false)}></div>
                    <div className='modalContainer2 sm:w-[90%] xsm:w-[100%] flex justify-center items-center w-[60%]'>
                        <img onClick={(e) => e.stopPropagation()} src={val.pictureURL} alt="image" className="w-full sm:max-h-[350px] md:max-h-[480px] lg:max-h-[480px] xl:max-h-[480px] 2xl:max-h-[480px] object-contain" />
                    </div>
                </>
            )}
            {modal && modalComponent}
            {oldModal && oldModalComponent}
        </div >
    )
}

export default SingleListCard