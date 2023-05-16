import { Rating } from '@mui/material';
import React, { useState } from 'react';
import ReactCountryFlag from "react-country-flag";
import { getCountryInfoByISO } from '../../utils/iso-country-currency';
import useAuth from '../../hooks/useAuth';
import Loader from '../Loader';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';

const PrivateInfo = () => {
    const { auth } = useAuth()

    const userInfoQuery = useQuery(['userDataPrivate', auth.userId], () => axios.get(`/user/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    if (userInfoQuery.isLoading && !userInfoQuery.data) {
        return (
            <Loader />
        )
    }
    else
        return (
            <>
                <div className='flex mx-[20px] xsm:justify-between sm:justify-between px-[10px] mt-[20px] gap-[0.938em] justify-center md:gap-[5.5em] lg:gap-[8.4em] xl:gap-[8em] 2xl:gap-[10em]'>
                    <div className='flex gap-[20px] flex-col'>
                        <div className='flex flex-col'>
                            <div>
                                <h1 className='text-[0.75em] font-[700] text-[#595959]'>{userInfoQuery?.data?.data?.name}</h1>
                                <h1 className='text-[0.5em] font-[500] text-[#595959bf] mb-[0.3125em]'>Joined {userInfoQuery?.data?.data?.createdAt.substring(0, 4)}</h1>
                            </div>
                            <div className='flex items-center gap-[3px]'>
                                <p className='text-[0.75em] font-[700]'>
                                    {isNaN(userInfoQuery?.data?.data?.rating.reduce((acc, rating) => acc + rating.rating, 0) / userInfoQuery?.data?.data?.rating.length)
                                        ? 0
                                        : Math.min(Math.max(userInfoQuery?.data?.data?.rating.reduce((acc, rating) => acc + rating.rating, 0) / userInfoQuery?.data?.data?.rating.length, 0), 5).toFixed(1)}
                                </p>
                                <Rating size='small' name="half-rating-read" value={Math.min(Math.max(userInfoQuery?.data?.data?.rating.reduce((acc, rating) => acc + rating.rating, 0) / userInfoQuery?.data?.data?.rating.length, 0), 5)} precision={0.5} readOnly />
                                <p className='text-[0.75em] text-[#595959]'>({userInfoQuery?.data?.data?.rating.length})</p>
                            </div>
                        </div>
                        <div className='flex flex-col'>
                            <h1 className='text-[0.75em] font-[600]' >Listing in</h1>
                            <div className='flex gap-[5px] mt-[5px]'>
                                <ReactCountryFlag
                                    countryCode={userInfoQuery?.data?.data?.country}
                                    svg
                                    style={{
                                        width: '1.8em',
                                        height: '1.2em',
                                    }}
                                    title="US"
                                />
                                <p className='text-[.75em] font-[500]'>{getCountryInfoByISO(userInfoQuery?.data?.data.country).countryName}</p>
                            </div>
                        </div>
                        {(userInfoQuery?.data?.data?.deliveryAddress?.city || userInfoQuery?.data?.data?.deliveryAddress?.country || userInfoQuery?.data?.data?.deliveryAddress?.line1 || userInfoQuery?.data?.data?.deliveryAddress?.line2) &&
                            <div className='flex flex-col'>
                                <h1 className='text-[0.75em] font-[600]'>Delivery Address</h1>
                                <h1 className='text-[0.75em] max-w-[150px] font-[500] text-[#595959bf]'>
                                    {userInfoQuery?.data?.data?.deliveryAddress?.line1 ? userInfoQuery?.data?.data?.deliveryAddress?.line1 + ", " : ""}
                                    {userInfoQuery?.data?.data?.deliveryAddress?.line2 ? userInfoQuery?.data?.data?.deliveryAddress?.line2 + ", " : ""}
                                    {userInfoQuery?.data?.data?.deliveryAddress?.city ? userInfoQuery?.data?.data?.deliveryAddress?.city + ", " : ""}
                                    {userInfoQuery?.data?.data?.deliveryAddress?.country ? userInfoQuery?.data?.data?.deliveryAddress?.country : ""}</h1>
                            </div>}
                        {(userInfoQuery?.data?.data?.shippingAddress?.city || userInfoQuery?.data?.data?.shippingAddress?.country || userInfoQuery?.data?.data?.shippingAddress?.line1 || userInfoQuery?.data?.data?.shippingAddress?.line2) &&
                            <div className='flex flex-col'>
                                <h1 className='text-[0.75em] font-[600]'>Shipping Address</h1>
                                <h1 className='text-[0.75em] max-w-[150px] font-[500] text-[#595959bf]'>
                                    {userInfoQuery?.data?.data?.shippingAddress?.line1 ? userInfoQuery?.data?.data?.shippingAddress?.line1 + ", " : ""}
                                    {userInfoQuery?.data?.data?.shippingAddress?.line2 ? userInfoQuery?.data?.data?.shippingAddress?.line2 + ", " : ""}
                                    {userInfoQuery?.data?.data?.shippingAddress?.city ? userInfoQuery?.data?.data?.shippingAddress?.city + ", " : ""}
                                    {userInfoQuery?.data?.data?.shippingAddress?.country ? userInfoQuery?.data?.data?.shippingAddress?.country : ""}</h1>
                            </div>}
                    </div>
                    <div className='flex flex-col'>
                        {userInfoQuery?.data?.data?.paymentMethods.length !== 0 &&
                            <div className='flex flex-col mb-[30px]'>
                                <>
                                    <h1 className='text-[0.75em] min-w-[120px] font-[600]' >Accepted payments</h1>
                                    {userInfoQuery?.data?.data?.paymentMethods.map((val, index) => {
                                        return (
                                            <div key={index} className='w-[100%] mt-[10px] flex gap-[6px]'>
                                                <div className='flex flex-col mt-[-3px]'>
                                                    <p className='peer-checked:text-[#000000] text-[#000000] text-[0.75em] font-[600]'>{val.name}</p>
                                                    <p className='peer-checked:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[600]'>{val.accountNo}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </>
                            </div>
                        }
                        {userInfoQuery?.data?.data?.shippingCostPaidBy && <div className='flex flex-col '>
                            <h1 className='text-[0.75em] font-[600]'>Who pays shipping? </h1>
                            <div className='w-[100%] mt-[4px] flex items-center gap-[6px]'>
                                <p className='text-[#AAAAAA] text-[0.70em] font-[600]'>{userInfoQuery?.data?.data?.shippingCostPaidBy}</p>
                            </div>
                        </div>}
                    </div>
                </div>
            </>
        )
}

export default PrivateInfo