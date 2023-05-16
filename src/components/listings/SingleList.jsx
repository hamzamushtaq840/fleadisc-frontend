import { Rating } from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { useNavigate } from 'react-router-dom';
import signin from '../../assets/signin.svg';
import SingleListCard from './SingleListCard';
import moment from 'moment';
import useAuth from '../../hooks/useAuth';

const SingleList = ({ value, index, discs }) => {
    const { auth } = useAuth();
    const navigate = useNavigate();
    const scrollableDivRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [currentTime, setCurrentTime] = useState(moment());
    const [screenSize, setScreenSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(moment());
        }, 1000); // trigger update every second

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    function handleScrollRight() {
        let value = 245;
        if (screenSize.width > 1279) {
            value = 245
        }
        if (screenSize.width < 1279) {
            value = 215
        }
        if (screenSize.width < 1023) {
            value = 205
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
        let value = 245;
        if (screenSize.width > 1279) {
            value = 245
        }
        if (screenSize.width < 1279) {
            value = 215
        }
        if (screenSize.width < 1023) {
            value = 205
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

    return (
        <>
            <div key={index} className='flex flex-col'>
                <div className='flex px-[19px] mb-[2px] gap-[0.563em] mt-[1.063em]'>
                    <img src={value.seller.profilePicture !== null ? value.seller.profilePicture : signin}
                        onClick={() => {
                            if (auth?.userId === value.seller._id) {
                                navigate('/profile/private')
                                return
                            }
                            navigate(`/profile/public/${value.seller._id}`)
                        }
                        } className="cursor-pointer rounded-full mt-1 xsm:h-[1.563em] sm:h-[1.563em] md:h-[1.9em] lg:h-[2em] xl:h-[2em] 2xl:h-[2em] xsm:w-[1.563em] sm:w-[1.563em] md:w-[1.9em] lg:w-[2em] xl:w-[2em] 2xl:w-[2em]" alt="user" />
                    <div className='flex flex-col justify-start'>
                        <h1 className='text-[0.75em] font-[500] cursor-pointer ' onClick={() => {
                            if (auth?.userId === value.seller._id) {
                                navigate('/profile/private')
                                return
                            }
                            navigate(`/profile/public/${value.seller._id}`)
                        }
                        } >{value.seller.name}</h1>
                        <div className='ml-[-0.2em] flex items-center gap-[0.3125em]'>
                            <Rating size='small' name="half-rating-read" value={Math.min(Math.max(value.seller.rating.reduce((acc, rating) => acc + rating.rating, 0) / value.seller.rating.length, 0), 5)} precision={0.5} readOnly />
                            <p className='text-[0.7em] font-[500]'>({value.seller.rating.length})</p>
                        </div>
                    </div>
                </div>

                <div className={`relative ${screenSize.width > 768 ? "px-[25px] " : "pl-[18px]"}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 left-0 top-[50%] translate-y-[-50%]  flex justify-center items-center h-[80%] w-[20px] select-none ' onClick={handleScrollLeft}><BsFillCaretLeftFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                    <div ref={scrollableDivRef} className={`flex pr-[4px] pl-[4px] ${screenSize.width > 768 ? "overflow-hidden" : "overflow-auto"}  pb-[5px] gap-[10px] mt-[11px] `}>
                        {discs.map((val, index) => {
                            let combinedDate
                            let isExpired
                            if (val.priceType === 'fixedPrice') {
                                combinedDate = moment(`${val.endDay} ${val.endTime}`, "YYYY-MM-DD HH:mm");
                                isExpired = combinedDate.isBefore(currentTime);
                            }
                            if (isExpired && val.priceType === 'auction')
                                return (null)
                            else if (!isExpired && val.priceType === 'auction')
                                return (<SingleListCard key={index} seller={value.seller} val={val} index={index} />);
                            else
                                return (<SingleListCard key={index} seller={value.seller} val={val} index={index} />);
                        })}
                    </div>
                    {screenSize.width > 768 && <h1 className='absolute transition-opacity duration-300 right-[0px] top-[50%] translate-y-[-50%] flex justify-center items-center h-[80%] w-[20px] select-none ' onClick={handleScrollRight}><BsFillCaretRightFill className='cursor-pointer text-[#a9a8a8] hover:text-text' /></h1>}
                </div>
            </div>
        </>
    )
}

export default SingleList