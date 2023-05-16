import React from 'react'
import user from '../../assets/signin.svg'
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios';
import Loader from '../Loader';

const OlderBids = ({ setModel, discId }) => {
    const userCurrency = "SEK";
    const { isLoading, data } = useQuery(['bids', discId, userCurrency], async () => {
        const response = await axios.get(`/disc/getBids/${discId}/bids`, { params: { userCurrency } });
        return response.data;
    }, { refetchOnMount: true });

    return (
        <>
            <div className='modalBackground' onClick={() => setModel(false)}></div>
            <div className='modalContainer px-[10px] pb-[50px] py-[30px]  xsm:text-[16px] sm:text-[16px] text-[20px] sm:w-[90%] xsm:w-[90%] w-[40%]  flex flex-col justify-center items-center'>
                <h1 className='text-[1.2em] mb-[20px] font-[600] px-[15px] text-start w-full'>Older Bids</h1>
                {isLoading ? (
                    <Loader />
                ) : (
                    <div className='flex flex-col w-[92%] px-[5px] overflow-y-auto max-h-[250px]'>
                        {data?.reverse().map((bid) => {
                            return (
                                <div key={bid._id}>
                                    <div className='flex w-full justify-between gap-[15px]'>
                                        <div className='flex flex-col xsm:min-w-[100px] sm:min-w-[100px] xsm:max-w-[100px] sm:max-w-[100px] min-w-[200px] gap-[8px]'>
                                            <h1 className='text-[0.9375em] font-[500]'>Bidder</h1>
                                            <div className='flex gap-[6px] items-center'>
                                                <img src={bid.user.profilePicture !== null ? bid.user.profilePicture : user} className="h-[25px] w-[25px] rounded-full" alt="" />
                                                <p className='text-[0.75em] font-[400]'>{bid.user.name}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-[8px] max-w-[80px] min-w-[80px] items-center'>
                                            <h1 className='text-[0.9375em] font-[500]'>Price</h1>
                                            <div className='flex min-h-[25px] items-center'>
                                                <p className='text-[0.75em] font-[400] text-center'>{bid.bidPrice.toFixed(0)} {userCurrency}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col gap-[8px]'>
                                            <h1 className='text-[0.9375em] font-[500] text-center'>Time</h1>
                                            <div className='flex gap-[6px] min-h-[25px] items-center'>
                                                <p className='text-[0.75em] font-[400] text-center'>{bid.createdAt}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='w-[100%] my-[15px] py-[0.3px] bg-[#323232]'></div>
                                </div>
                            )
                        })}
                    </div>)}

            </div>
        </>
    )
}

export default OlderBids