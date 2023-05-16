import React, { useEffect, useState } from 'react';
import SingleBuyItem from './SingleBuyItem';
import useAuth from './../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import { ColorRing } from 'react-loader-spinner';
import { io } from 'socket.io-client'
import { toast } from 'react-toastify'
import Show2 from './Show2';
import Loader from '../Loader';

const Buying = () => {
    const { auth, socket } = useAuth()

    const buyingQuery = useQuery(['buyingDiscs', auth.userId], () => axios.get(`/disc/buying/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const cancelQuery = useQuery(['buyingCancel', auth.userId], () => axios.get(`/delivery/getBuyingCancel/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    useEffect(() => {
        buyingQuery.refetch()
        if (socket) {
            socket.on('refetchBuying', () => {
                buyingQuery.refetch()
                cancelQuery.refetch()
            })
        }
    }, [])


    if (buyingQuery.isLoading) {
        return (
            <Loader />
        )
    }
    else
        return (
            <div className=' bg-[#FAFAFA] flex justify-center px-[1.25em] py-[0.625em] text-[1.2rem] xsm:text-[1rem] sm:text-[1rem] '>
                <div className='w-[80vw] sm:w-[100vw] xsm:w-[100vw]'>
                    {buyingQuery?.data?.data?.length === 0 ? (
                        <p className='flex text-center min-h-[40vh] items-center justify-center text-[1em] text-[#00000080]'>No Purchase Found</p>
                    ) : (
                        buyingQuery?.data?.data?.map((value, index) => {
                            return (
                                <div key={index}>
                                    <SingleBuyItem value={value} />
                                </div>
                            )
                        })
                    )}
                </div>
                {cancelQuery?.data?.data?.length > 0 &&
                    cancelQuery?.data?.data?.map((val, index) => {
                        return (
                            <Show2 key={index} val={val} />
                        )
                    })
                }
            </div >
        )
}

export default Buying