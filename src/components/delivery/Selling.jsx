import React, { useEffect } from 'react'
import SingleSellItem from './SingleSellItem'
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import { ColorRing } from 'react-loader-spinner';
import { toast } from 'react-toastify'
import Show from './Show';
import Loader from '../Loader';

const Selling = () => {
    const { auth, socket } = useAuth()

    const sellingQuery = useQuery(['sellingDiscs', auth.userId], () => axios.get(`/disc/selling/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const cancelQuery = useQuery(['sellingCancel', auth.userId], () => axios.get(`/delivery/getSellingCancel/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    useEffect(() => {
        sellingQuery.refetch()
        cancelQuery.refetch()
        if (socket) {
            socket.on('refetchSelling', () => {
                sellingQuery.refetch()
                cancelQuery.refetch()
            })
        }
    }, [])

    if (sellingQuery.isLoading) {
        return (
            <Loader />
        )
    }
    else
        return (
            <div className=' bg-[#FAFAFA] flex justify-center px-[1.25em] py-[0.625em] text-[1.2rem] xsm:text-[1rem] sm:text-[1.125rem] '>
                <div className='w-[80vw] sm:w-[100vw] xsm:w-[100vw]'>
                    {sellingQuery?.data?.data?.length === 0 ? (
                        <p className='flex text-center min-h-[40vh] items-center justify-center text-[1em] text-[#00000080]'>No Sale Found</p>
                    ) : (
                        sellingQuery?.data?.data?.map((value, index) => (
                            <div key={index}>
                                <SingleSellItem value={value} />
                            </div>
                        ))
                    )}
                </div>
                {cancelQuery?.data?.data?.length > 0 &&
                    cancelQuery?.data?.data?.map((val, index) => {
                        return (
                            <Show key={index} val={val} />
                        )
                    })
                }
            </div>
        )
}

export default Selling