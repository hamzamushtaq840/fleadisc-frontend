import Rating from '@mui/material/Rating';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import user from './../../assets/signin.svg';
import SingleBuyDisc from './SingleBuyDisc';

const SingleBuyItem = ({ value }) => {
    const textareaRef = useRef();
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [ratings, setRating] = useState(0)
    const [addresses, setAddresses] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const addressValues = [value?.buyer?.deliveryAddress?.city, value?.buyer?.deliveryAddress?.country, value?.buyer?.deliveryAddress?.line1, value?.buyer?.deliveryAddress?.line2, value?.buyer?.deliveryAddress?.postalCode, value?.buyer?.deliveryAddress?.state];
    const filteredAddressValues = addressValues.filter(val => val !== "");
    const userCurrency = 'SEK'
    useEffect(() => {
        if (value.addressSent === true)
            setAddresses(value.address);
        else {
            const concatenatedAddresses = (filteredAddressValues ?? []).filter(val => val !== undefined) // Add nullish coalescing operator check for filteredAddressValues
                .map((val, index) => {
                    if (index === filteredAddressValues.length - 1) {
                        return val;
                    } else {
                        return val + ', ';
                    }
                })
                .join('');
            if (concatenatedAddresses === '')
                setAddresses('No address found, this can be added in your profile settings');
            else {
                setAddresses(concatenatedAddresses || '');
            }
        }
    }, []);

    const handleBuyerChange = (event) => {
        const selectedPaymentMethodId = event.target.id;
        setSelectedPaymentMethod(selectedPaymentMethodId);
    };

    const handleButtonClick = () => {
        textareaRef.current.disabled = false;
        textareaRef.current.select();
    };

    const confirmPurchase = useMutation((data) => axios.post(`/delivery/confirmPurchase`, data), {
        onSuccess: () => {
            queryClient.invalidateQueries('sellingDiscs')
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const sendAddress = useMutation((data) => axios.post(`/delivery/sendAddress`, data), {
        onSuccess: () => {
            queryClient.invalidateQueries('buyingDiscs')
            textareaRef.current.disabled = true;
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const paymentSent = useMutation((data) => axios.post(`/delivery/paymentSent`, data), {
        onSuccess: () => {
            queryClient.invalidateQueries('buyingDiscs')
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const confirmParcel = useMutation((data) => axios.post(`/delivery/confirmParcel`, data), {
        onSuccess: () => {
            queryClient.invalidateQueries('buyingDiscs')
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const rating = useMutation((data) => axios.post(`/delivery/rating`, data), {
        onSuccess: (res) => {
            queryClient.invalidateQueries('buyingDiscs')
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const totalCost = value.disc.reduce((acc, curr) => {
        return acc + curr.discId?.buyer?.buyPrice
    }, 0)

    const handleRating = (e) => {
        setRating(e.target.value);
        rating.mutate({ id: value._id, sellerId: value.seller._id, buyerId: value.buyer._id, rating: e.target.value, from: 'buy' })
    }

    return (
        <div className='flex flex-col'>
            <div className='flex flex-col w-full justify-start mt-[20px] gap-[1em] xsm:gap-[1.275em] sm:gap-[1.575em]'>
                <div className='flex gap-[20px] items-center'>
                    <div className='flex gap-[0.563em] '>
                        <img onClick={() => navigate('/profile/public')} src={value.seller.profilePicture === null ? user : value.seller.profilePicture} className="cursor-pointer rounded-full mt-[3px] xsm:h-[1.563em] sm:h-[1.563em] md:h-[1.9em] lg:h-[2em] xl:h-[2em] 2xl:h-[2em] xsm:w-[1.563em] sm:w-[1.563em] md:w-[1.9em] lg:w-[2em] xl:w-[2em] 2xl:w-[2em]" alt="user" />
                        <div className='flex flex-col justify-start'>
                            <h1 className='text-[0.75em] font-[500] cursor-pointer' onClick={() => navigate('/profile/public')} >{value.seller.name}</h1>
                            <div className='ml-[-0.2em] flex gap-[5px] mb-[6px]'>
                                <Rating size='small' name="half-rating-read" value={Math.min(Math.max(value.seller.rating.reduce((acc, rating) => acc + rating.rating, 0) / value.seller.rating.length, 0), 5)} precision={0.5} readOnly />
                                <p className='text-[0.7em] font-[500]'>({value.seller.rating.length})</p>
                            </div>
                        </div>
                    </div>
                    <div className='flex'><button onClick={() => navigate("/messages/chat", { state: { user2: value.seller._id, userName: value.seller.name, userImage: value.seller.profilePicture !== null ? value.seller.profilePicture : null, from: 'delivery' } })} className='text-[#ffffff]  button rounded-[4px] text-[.75em] py-[0.5em] px-[1.125em] bg-primary '>Message Seller</button></div>
                </div>
                <div className='flex gap-[20px] flex-wrap'>
                    {value.disc.map((v, index) => {
                        return (
                            <React.Fragment key={index}>
                                <SingleBuyDisc value={v} temp={value} seller={value.seller} />
                            </React.Fragment >
                        )
                    })}
                </div>
            </div>
            <div className='mt-[55px] xsm:mt-[35px] sm:mt-[35px] mb-[20px]'>
                {value.soldToNextBidder === true &&
                    <div className='flex flex-col gap-[20px]'>
                        <h1 className='text-[0.75em] font-[500] text-center'>The seller offered it to you as you were the second highest bidder</h1>
                        <div className='flex gap-[0.688em] xsm:h-[55px] sm:h-[55px] h-[65px]'>
                            <div className='flex flex-col items-center '>
                                <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${(value.purchaseConfirmed) ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                                <div className='div h-full flex flex-col'></div>
                            </div>
                            <div className='mt-[-0.3em]'>
                                <button
                                    style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
                                    className={`text-[#ffffff] min-w-[105px] xsm:min-h-[30px] sm:min-h-[30px] min-h-[35px] rounded-[8px] py-[0.5em] px-[0.906em] text-[0.75em] bg-primary relative ${confirmPurchase.isLoading ? "opacity-50 cursor-wait" : ""}`}
                                    onClick={() => { confirmPurchase.mutate({ id: value._id, buyerId: value.buyer._id, sellerId: value.seller._id, from: 'buyer' }) }}
                                    disabled={value.purchaseConfirmed}
                                >
                                    {confirmPurchase.isLoading && (
                                        <FaSpinner
                                            className="animate-spin absolute inset-0 m-auto"
                                            style={{ width: "1em", height: "1em" }}
                                        />
                                    )}
                                    {!confirmPurchase.isLoading && (value.purchaseConfirmed ? "Purchased Confirmed" : "Confirm Purchase")}
                                </button>
                            </div>
                        </div>
                    </div>}
                {value.soldToNextBidder === false && <div className='flex gap-[0.688em] sm:h-[50px] xsm:h-[50px] h-[70px] '>
                    <div className='flex flex-col items-center'>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${value.purchaseConfirmed ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                        <div className='div h-full flex flex-col'></div>
                    </div>
                    <div>
                        <h1 className={`text-[0.75em] font-[300] ${value.purchaseConfirmed ? 'text-[#000000]' : 'text-[#78636382]'}`}>{value.purchaseConfirmed ? "Seller has confirmed purchase" : "Waiting for purchase confirmation"}</h1>
                    </div>
                </div>}
                <div className='flex gap-[0.688em] sm:h-[55px] xsm:h-[55px] h-[75px] '>
                    <div className='flex flex-col items-center  '>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${value.addressSent ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                        <div className='div h-full flex flex-col'></div>
                    </div>
                    <div className='flex w-full items-start gap-[0.875em] mt-[-0.3em]'>
                        <button style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
                            onClick={() => { if (addresses.trim() === '' || addresses.trim() === 'No address found, this can be added in your profile settings') { toast.error('Please add address'); return }; sendAddress.mutate({ id: value._id, sellerId: value.seller._id, address: addresses }) }}
                            className={`text-[#ffffff] relative min-w-[105px] min-h-[30px] rounded-[8px] py-[0.5em] px-[0.906em] text-[0.75em] ${value.purchaseConfirmed ? 'bg-primary' : 'bg-[#81b29a4b]'} ${sendAddress.isLoading ? "opacity-50 cursor-wait" : ""} `}
                            disabled={value.addressSent === true || value.purchaseConfirmed === false ? true : false}>
                            {sendAddress.isLoading && (
                                <FaSpinner
                                    className="animate-spin absolute inset-0 m-auto"
                                    style={{ width: "1em", height: "1em" }}
                                />
                            )}
                            {!sendAddress.isLoading && (value.addressSent ? "Address Sent" : "Send Address")}
                        </button>
                        <textarea ref={textareaRef} disabled className={`sm:w-full xsm:w-full w-[50%] min-h-[50px] resize-none  pl-[5px] rounded-[6px] border-[#333] text-[0.75em] bg-[#fafafa00] ${value.purchaseConfirmed ? 'text-[#000000]' : 'text-[#78636382]'} ${value.addressSent === true ? " overflow-hidden" : "bg-[#ffffff]"}`} onChange={(e) => setAddresses(e.target.value)} value={addresses} />
                        <button className={` text-[0.7em] ${value.purchaseConfirmed === true && value.addressSent === false ? 'text-[#000000] hover:underline' : 'hidden text-[#78636382]'}`} onClick={handleButtonClick} disabled={value.addressSent === true || value.purchaseConfirmed === false ? true : false}>Change</button>
                    </div>
                </div>
                <div className={`flex gap-[0.688em]  ${value.paymentMethod.length !== 0 ? "xsm:h-[135px] sm:h-[135px] h-[160px]" : "xsm:h-[95px] sm:h-[95px] h-[110px]"}`}>
                    <div className='flex flex-col items-center '>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em]  ${value.paymentSent ? 'bg-[#81b29aac] border-[#81B29A33]' : 'bg-[#ffffff] border-[#ccc]'} `}></div>
                        <div className='div h-full flex flex-col'></div>
                    </div>
                    <div>
                        <h1 className={`text-[0.75em] mb-[10px] font-[300] ${value.addressSent ? 'text-[#000000]' : 'text-[#78636382]'}`}>{value.paymentAddressConfirmed === true ? value.shippingCostPaidBy === 'Buyer' ? `Total cost inc shipping: ${totalCost} ${userCurrency} (${totalCost} + ${value.shippingCost === null ? "0" : value.shippingCost})` : `Total cost excluding shipping: (${totalCost})` : "Total cost : Awaiting seller"}</h1>
                        <div className='flex flex-col  items-start '>
                            {value.paymentMethod.length !== 0 && <div className='flex mt-[5px] mb-[10px] flex-col items-start '>
                                <div className='flex gap-[0.625em]'>
                                    {value.paymentMethod.map((v, index) => {
                                        return (
                                            <div className='flex gap-[6px]' key={index}>
                                                <input
                                                    id={v.accountNo}
                                                    name='check'
                                                    checked={value.paymentSent === true ? value.paymentMethod.some((val) => { return (val.accountNo === v.accountNo && val.selected === true) }) : selectedPaymentMethod === v.accountNo ? true : false}
                                                    type='checkbox'
                                                    onChange={handleBuyerChange}
                                                    disabled={value.paymentSent === true ? true : false}
                                                    className='peer/published w-[18px] h-[18px] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black'
                                                />
                                                <div className='flex  mt-[-2px] flex-col gap-[2px]'>
                                                    <p className='text-[#000000] text-[12px] font-[600]'>{v.name}</p>
                                                    <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[12px] font-[500]'>{v.accountNo}</p>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>}
                            <button onClick={() => { if (selectedPaymentMethod === '') { return toast.error('Please select the payment') } paymentSent.mutate({ selectedPaymentMethod: selectedPaymentMethod, id: value._id, sellerId: value.seller._id }) }} className={`button relative min-h-[30px] text-[#ffffff] ${value.accountNo !== null ? "mt-[5px]" : ""} min-w-[105px] rounded-[8px] py-[0.5em] px-[0.906em] text-[0.75em] ${value.paymentAddressConfirmed === true ? 'bg-primary' : 'bg-[#81b29a4b]'} `} disabled={value.paymentAddressConfirmed === false || value.paymentSent === true ? true : false}>
                                {paymentSent.isLoading && (
                                    <FaSpinner
                                        className="animate-spin absolute inset-0 m-auto"
                                        style={{ width: "1em", height: "1em" }}
                                    />
                                )}
                                {!paymentSent.isLoading &&
                                    (value.paymentSent ? "Payment Sent" : "Confirm Payment Sent")}</button>
                        </div>
                    </div>
                </div>
                <div className={`flex gap-[0.688em] sm:h-[45px] xsm:h-[45px] h-[75px] `}>
                    <div className='flex flex-col items-center '>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${value.paymentConfirmed ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                        <div className='div h-full flex flex-col'></div>
                    </div>
                    <div>
                        <h1 className={`text-[0.75em] font-[300] ${value.paymentSent ? 'text-[#000000]' : 'text-[#78636382]'}`}>{value.paymentConfirmed ? "Payment confirmed by seller." : "Waiting for payment to be confirmed by seller."}</h1>
                    </div>
                </div>
                <div className={`flex gap-[0.688em] ${!value.parcelSent ? 'sm:h-[60px] xsm:h-[60px] h-[70px] ' : 'sm:h-[45px] xsm:h-[45px] h-[70px] '}`}>
                    <div className='flex flex-col items-center '>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${value.parcelSent ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                        <div className='div h-full flex flex-col'></div>
                    </div>
                    <div>
                        <h1 className={`text-[0.75em] font-[300] ${value.parcelSent ? 'text-[#000000]' : 'text-[#78636382]'}`}>{value.parcelSent ? "Parcel has been sent by seller." : "Waiting for confirmation that parcel has been sent be seller."}</h1>
                    </div>
                </div>

                <div className='flex gap-[0.688em] sm:h-[55px] xsm:h-[55px] h-[80px] '>
                    <div className='flex flex-col items-center '>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${value.parcelReceived ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                        <div className='div h-full flex flex-col'></div>
                    </div>
                    <div className='mt-[-0.3em]'>
                        <button style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }}
                            onClick={() => confirmParcel.mutate({ id: value._id, sellerId: value.seller._id })}
                            className={`relative min-h-[30px] text-[#ffffff] min-w-[105px] rounded-[8px] py-[0.5em] px-[0.906em] text-[0.75em]  ${value.parcelSent ? 'bg-primary' : 'bg-[#81b29a4b]'} `} disabled={value.parcelSent === false ? true : false}>
                            {confirmParcel.isLoading && (
                                <FaSpinner
                                    className="animate-spin absolute inset-0 m-auto"
                                    style={{ width: "1em", height: "1em" }}
                                />
                            )}
                            {!confirmParcel.isLoading &&
                                (!value.parcelSent ? "Parcel received" : value.parcelReceived ? "Parcel received" : "Confirm received parcel")}</button>
                    </div>
                </div>
                <div className='flex gap-[0.688em] h-[50px] '>
                    <div className='flex flex-col items-center '>
                        <div className={`p-[0.363em] mt-[2px] rounded-full border-[0.063em] ${value.parcelReceived ? 'bg-[#81b29aac] border-[#81B29A33]' : 'border-[#ccc]'} `}></div>
                    </div>
                    <div >
                        <h1 className={`text-[0.75em] font-[300] ${value.parcelReceived ? 'text-[#000000]' : 'text-[#78636382]'}`}>{value.parcelReceived ? "Delievery Finished" : "Delievery Not Finished"}</h1>
                    </div>
                </div>
                {value.parcelReceived === true && <div className='flex flex-col justify-center items-center'>
                    {rating.isLoading && (
                        <div className='bg-primary absolute min-h-[2em]'>
                            <FaSpinner
                                className="animate-spin absolute inset-0 m-auto"
                                style={{ width: "1em", height: "1em" }}
                            />
                        </div>
                    )}
                    {!rating.isLoading &&
                        <>
                            <p className='text-[0.75em] mb-[6px]'>Leave a rating of<span className='text-[#000000] font-[700]'> seller</span></p>
                            <Rating size='large' className='mb-[10px]' name="half-rating-read" onChange={handleRating} precision={0.5} />
                        </>}
                </div>}
            </div>
            <hr className='mt-[10px] w-full mb-[15px]' />
        </div >
    )
}

export default SingleBuyItem