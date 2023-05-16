import { Rating } from '@mui/material'
import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react'
import axios from '../../api/axios';
import { toast } from 'react-toastify';

const CancelBuyerConfirm = ({ setModel, val }) => {
    const [rating, setRating] = useState(0)

    const cancelRemove = useMutation((data) => axios.post(`/delivery/removeCancel`, data), {
        onSuccess: () => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const giveRating = useMutation((data) => axios.post(`/delivery/giveRating`, data), {
        onSuccess: (res) => {
            toast.success('Rating given')
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleCancelConfirm = () => {
        setModel(false)
        cancelRemove.mutate({ removeId: val._id })
        if (rating !== 0) {
            console.log('i ran');
            giveRating.mutate({ userId: val.sellerId, rating: rating })
        }
    }

    return (
        <>
            <div className='modalBackground' onClick={() => setModel(false)}></div>
            <div className='modalContainer xsm:text-[16px] sm:text-[16px] text-[20px] sm:h-[35%] sm:w-[80%] xsm:w-[80%] xsm:h-[35%] h-[40%] w-[40%] flex flex-col justify-center items-center'>
                <h1 className='text-[1.25em] '>Cancel confirm</h1>
                <p className='w-[80%] text-[.75em] text-center font-[400] mt-[0.688em]'><span className='font-[800]'>{val.sellerId.name}</span> has canceled the purchase of <span className='font-[800]'> {val.disc.discName}</span>, <span className='font-[800]'>{val.disc.brand}</span></p>
                <p className='w-[80%] text-center text-[.75em] font-[400] mt-[1.5em]'>Leave a rating of <span className='font-[800]'>seller.</span></p>
                <Rating size='large' className='mb-[10px]' name="half-rating-read" onChange={(e) => setRating(Number(e.target.value))} value={rating} precision={0.5} />
                <button onClick={handleCancelConfirm} className='button rounded-[2px] py-[0.625em] relative min-h-[2.0625em] min-w-[6.75em] text-[.75em] px-[2.813em] text-[#ffffff] bg-primary'>
                    {(cancelRemove.isLoading || giveRating.isLoading) && (
                        <FaSpinner
                            className="animate-spin absolute inset-0 m-auto"
                            style={{ width: "1em", height: "1em" }}
                        />
                    )}
                    {!(cancelRemove.isLoading || giveRating.isLoading) && "Confirm"}
                </button>
            </div>
        </>
    )
}

export default CancelBuyerConfirm