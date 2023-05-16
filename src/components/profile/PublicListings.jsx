import React, { useEffect, useRef, useState } from 'react';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import SingleListCard from '../listings/SingleListCard';
import disc from './../../assets/disc.svg';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import { useParams } from 'react-router-dom';
import { getCountryInfoByISO } from '../../utils/iso-country-currency';
import FinishedListing from './FinishedListing';
import { ColorRing } from 'react-loader-spinner';
import Loader from '../Loader';

const PublicListing = () => {
    const { id } = useParams();
    const { auth } = useAuth();
    const userCurrency = "SEK";
    const [isHovered, setIsHovered] = useState(false);
    const scrollableDivRef = useRef(null);
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const activeDiscsQuery = useQuery(['discsBySellerId2', id], () => axios.get(`/disc/getActiveDiscs2/${id}/${userCurrency}`), {
        onSuccess: () => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const finishedDiscsQuery = useQuery(['finishedDiscsBySellerId2', id], () => axios.get(`/disc/getFinishedDiscs2/${id}/${userCurrency}`), {
        onSuccess: () => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

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

    if (activeDiscsQuery.isLoading || finishedDiscsQuery.isLoading && !activeDiscsQuery.isLoading.data || !finishedDiscsQuery.data) {
        return (
            <Loader />
        )
    }
    else
        return (
            <div className='flex items-center flex-col mt-[25px] gap-[30px]'>
                {activeDiscsQuery?.data?.data?.length === 0 &&
                    <div className='flex w-full flex-col'>
                        <h1 className='font-[700] w-full px-[25px] text-[1.25em] mb-[15px]'>Active Listings</h1>
                        <div className='flex justify-center text-[.9em] min-h-[30vh] text-[#00000080] items-center w-full'>No Active Listings</div>
                    </div>
                }
                {activeDiscsQuery?.data?.data?.length > 0 && <div className={`relative  w-[100%] ${screenSize.width > 768 ? "px-[25px] " : "pl-[18px]"}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <h1 className='font-[700] pl-[5px] text-[1.25em] mb-[15px]'>Active Listings</h1>
                    {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 left-0 top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none' onClick={handleScrollLeft}><BsFillCaretLeftFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                    <div ref={scrollableDivRef} className={`flex pr-[4px] pl-[5px]  ${screenSize.width > 768 ? "overflow-hidden" : "overflow-auto"} pb-[5px] gap-[10px] mt-[11px] `}>
                        {activeDiscsQuery?.data?.data?.map((val, index) => {
                            return (
                                <SingleListCard key={index} val={val} seller={val.seller} index={index} />
                            )
                        })}
                    </div>
                    {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 right-[0px] top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none' onClick={handleScrollRight}><BsFillCaretRightFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                </div>}
                {finishedDiscsQuery?.data?.data?.length === 0 &&
                    <div className='flex w-full flex-col'>
                        <h1 className='font-[700] w-full px-[25px] text-[1.25em] mb-[15px]'>Finished Listings</h1>
                        <div className='flex justify-center text-[.9em] min-h-[30vh] text-[#00000080] items-center w-full'>No Finished Listings</div>
                    </div>
                }
                {finishedDiscsQuery?.data?.data?.length > 0 && <div className={`relative  w-[100%] ${screenSize.width > 768 ? "px-[25px]" : "pl-[18px]"}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    <div className='flex'>
                        <h1 className='font-[700] pl-[5px] text-[1.25em] mb-[5px]'>Finished Listings</h1>
                    </div>
                    {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 left-0 top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none' onClick={handleScrollLeft}><BsFillCaretLeftFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                    <div ref={scrollableDivRef} className={`flex pr-[4px] pl-[5px] ${screenSize.width > 768 ? "overflow-hidden" : "overflow-auto"} pb-[5px] gap-[10px] mt-[11px] `}>
                        {finishedDiscsQuery?.data?.data.map((value, index) => {
                            return (
                                <FinishedListing key={index} value={value} userCurrency={userCurrency} />
                            )
                        })}
                    </div>
                    {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 right-[0px] top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none' onClick={handleScrollRight}><BsFillCaretRightFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                </div>}
            </div>
        )
}

export default PublicListing