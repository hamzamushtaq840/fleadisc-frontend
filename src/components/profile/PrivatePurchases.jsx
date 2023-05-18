import React, { useEffect, useRef, useState } from 'react';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import useAuth from '../../hooks/useAuth'
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import moment from 'moment';
import Loader from '../Loader';

const PrivatePurchases = () => {
    const [isHovered, setIsHovered] = useState(false);
    const scrollableDivRef = useRef(null);
    const { auth } = useAuth()
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });
    let userCurrency = 'SEK'

    function handleScrollRight() {
        let value = 220;
        if (screenSize.width > 1279) {
            value = 220
        }
        if (screenSize.width < 1279) {
            value = 210
        }
        if (screenSize.width < 1023) {
            value = 200
        }
        if (screenSize.width < 767) {
            value = 160
        }
        scrollableDivRef.current.scrollBy({
            left: value,
            behavior: 'smooth',
        });
    }

    function handleScrollLeft() {
        let value = 220;
        if (screenSize.width > 1279) {
            value = 220
        }
        if (screenSize.width < 1279) {
            value = 210
        }
        if (screenSize.width < 1023) {
            value = 200
        }
        if (screenSize.width < 767) {
            value = 160
        }
        scrollableDivRef.current.scrollBy({
            left: -value,
            behavior: 'smooth',
        });
    }

    function getMonthAndDate(dateString) {
        const date = moment(dateString);
        const monthName = date.format("MMM");
        const dayOfMonth = date.format("D");
        return `${dayOfMonth} ${monthName}`;
    }

    function remainingTime(endDay, endTime) {
        const endDateTime = moment(`${endDay} ${endTime}`);
        const start = moment();
        const diff = start.diff(endDateTime);
        const duration = moment.duration(diff);
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        let passedTime;
        if (years > 0) {
            passedTime = `${years}${years === 1 ? 'y' : 'y'}`;
        } else if (months > 0) {
            passedTime = `${months}${months === 1 ? 'm' : 'm'}`;
        } else if (days > 0) {
            passedTime = `${days}${days === 1 ? 'd' : 'd'} ${hours}h`;
        } else if (hours > 0) {
            passedTime = `${hours}h ${minutes}${minutes === 1 ? 'm' : 'm'}`;
        } else if (minutes > 0) {
            passedTime = `${minutes}${minutes === 1 ? 'm' : 'm'}`;
            if (seconds > 0) {
                passedTime += ` ${seconds}s`;
            }
        } else {
            passedTime = `${seconds} s`;
        }

        return passedTime;
    }

    const boughtDiscQuery = useQuery(['boughtDiscs', auth.userId], () => axios.get(`/disc/boughtListing/${auth.userId}`), {
        onSuccess: () => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    let boughtCost = 0;

    boughtDiscQuery?.data?.data?.forEach(disc => {
        if (disc.buyer === null) {
            boughtCost += parseInt(disc.startingPrice, 10); // Convert string to number with base 10 and then add
        } else {
            boughtCost += parseInt(disc.buyer.buyPrice, 10); // Convert string to number with base 10 and then add
        }
    });

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    if (boughtDiscQuery.isLoading && !boughtDiscQuery.data) {
        return (
            <Loader />
        )
    }
    else
        return (
            <div className='flex justify-center mt-[25px]'>
                {boughtDiscQuery?.data?.data?.length === 0 &&
                    <div className='flex w-full flex-col'>
                        <h1 className='font-[700] w-full px-[25px] text-[1.25em] mb-[15px]'>Purchased Listings</h1>
                        <div className='flex justify-center text-[.9em] min-h-[30vh] text-[#00000080] items-center w-full'>No Purchased Listings</div>
                    </div>
                }
                {boughtDiscQuery?.data?.data?.length > 0 &&
                    <div className={`relative xsm:w-screen sm:w-screen w-[100%] ${screenSize.width > 768 ? "px-[25px]" : "pl-[18px]"}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                        <div className='flex gap-[0.8125em]'>
                            <h1 className='font-[700] pl-[4px] text-[1.25em] mb-[10px]'>Purchased Listings</h1>
                            {boughtCost > 0 && <span className='text-[1.25em] font-[700] text-[#00000080]'>({boughtCost} sek)</span>}
                        </div>
                        {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 left-0 top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none' onClick={handleScrollLeft}><BsFillCaretLeftFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                        <div ref={scrollableDivRef} className={`flex pr-[4px] pl-[4px] ${screenSize.width > 768 ? "overflow-hidden" : "overflow-auto"} pb-[5px] gap-[10px] mt-[11px]`}>
                            {boughtDiscQuery?.data?.data.map((value, index) => {
                                return (
                                    <div key={index} className={`flex relative mb-[10px]  xsm:text-[1.07rem] sm:text-[1.07rem] text-[1.2rem] pb-[8px] card rounded-[8px] bg-[#ffffff] flex-wrap xsm:min-w-[170px] xsm:max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px]  h-[0%] flex-col`}>
                                        <img src={value.pictureURL} className=' hover:opacity-[0.8] xsm:h-[170px] rounded-t-[8px] sm:h-[170px] md:h-[200px] lg:h-[210px] xsm:min-w-[170px] xsm:max-w-[170px] sm:min-w-[170px] sm:max-w-[170px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:h-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px] 2xl:h-[240px] cursor-pointer' alt="Disc Image" />
                                        <div className='flex justify-between px-[0.625em] py-[0.425em]'>
                                            <div className='flex flex-col justify-between'>
                                                <div className='flex flex-col items-start'>
                                                    <div className='flex  relative justify-start '>
                                                        <h1 className='text-[0.75em] font-[700]' >{value.discName}</h1>
                                                        <span className='px-[0.5em] mt-[2px] absolute right-[-25px] top-[-1px]  ml-[-5px] text-[0.563em] border-[1px] rounded-full border-[#595959]'>{value.condition}</span>
                                                    </div>
                                                    <h1 className='text-[0.55em] font-[500] min-h-[20.81px] inline leading-[11px] text-[##595959]'>{value.brand}</h1>
                                                </div>
                                                <div className='flex mt-[5px] flex-col  text-[#595959]'>
                                                    <span className='font-[600] text-[0.6em]'>{getMonthAndDate(value.endDay)} - {value.endTime} </span>
                                                    <span className='font-[500] text-[#595959BF] text-[0.55em]'>Bought {remainingTime(value.endDay, value.endTime)}</span>
                                                </div>
                                            </div>

                                            <div className='flex flex-col  justify-end items-end'>
                                                <div className='flex flex-col items-end'>
                                                    {value.priceType === 'fixedPrice' && <span className='text-[0.65em] mb-[-3px] text-end flex items-end  font-[600]'>{value.startingPrice} {userCurrency}</span>}
                                                    {(value.priceType === 'auction' && value.buyer === null) && <span className='text-[0.65em] mb-[-3px] text-end flex items-end font-[600]'>{value?.startingPrice} {userCurrency}</span>}
                                                    {(value.priceType === 'auction' && value.buyer !== null) && <span className='text-[0.65em] mb-[-3px] text-end flex items-end font-[600]'>{value?.buyer?.buyPrice} {userCurrency}</span>}
                                                    {value.priceType === 'fixedPrice' && <span className='text-[0.6em] font-[500] text-[#595959bf]'>Fixed price</span>}
                                                    {(value.priceType !== 'fixedPrice') &&
                                                        <div className='flex items-center  text-[1em]'>
                                                            <p className='text-[0.6em] cursor-pointer hover:underline hover:text-text font-[500] text-[#595959BF] '>{value.bids.length} Bids</p>
                                                        </div>}
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 right-[0px] top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none' onClick={handleScrollRight}><BsFillCaretRightFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                    </div>}
            </div>
        )
}

export default PrivatePurchases