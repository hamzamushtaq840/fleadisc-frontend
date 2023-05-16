import React, { useState } from 'react';
import ReactFlagsSelect from "react-flags-select";
import add from '../../assets/addd.svg';
import cross from '../../assets/cross.svg';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';

const PrivateInfoEdit = () => {
    const { auth } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const userInfoQuery = useQuery(['userData', auth.userId], () => axios.get(`/user/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const userEditMutation = useMutation((data) => axios.post(`/user/editUser/${auth.userId}`, data), {
        onSuccess: () => {
            userInfoQuery.refetch()
            toast.success('Profile updated')
            queryClient.invalidateQueries('userDataPrivate')
            navigate('/profile/private')
        },
        onError: (error) => {
            console.log(error);
        }
    });
    const [formData, setFormData] = useState({
        name: userInfoQuery?.data?.data?.name || "",
        country: userInfoQuery?.data?.data?.country || "",
        city: userInfoQuery?.data?.data?.city || "",
        deliveryAddressLine1: userInfoQuery?.data?.data?.deliveryAddress ? userInfoQuery?.data?.data?.deliveryAddress.line1 || "" : "",
        deliveryAddressLine2: userInfoQuery?.data?.data?.deliveryAddress ? userInfoQuery?.data?.data?.deliveryAddress.line2 || "" : "",
        deliveryPostalCode: userInfoQuery?.data?.data?.deliveryAddress ? userInfoQuery?.data?.data?.deliveryAddress.postalCode || "" : "",
        deliveryCity: userInfoQuery?.data?.data?.deliveryAddress ? userInfoQuery?.data?.data?.deliveryAddress.city || "" : "",
        deliveryState: userInfoQuery?.data?.data?.deliveryAddress ? userInfoQuery?.data?.data?.deliveryAddress.state || "" : "",
        deliveryCountry: userInfoQuery?.data?.data?.deliveryAddress ? userInfoQuery?.data?.data?.deliveryAddress.country || "" : "",
        shippingAddressLine1: userInfoQuery?.data?.data?.shippingAddress ? userInfoQuery?.data?.data?.shippingAddress.line1 || "" : "",
        shippingAddressLine2: userInfoQuery?.data?.data?.shippingAddress ? userInfoQuery?.data?.data?.shippingAddress.line2 || "" : "",
        shippingPostalCode: userInfoQuery?.data?.data?.shippingAddress ? userInfoQuery?.data?.data?.shippingAddress.postalCode || "" : "",
        shippingCity: userInfoQuery?.data?.data?.shippingAddress ? userInfoQuery?.data?.data?.shippingAddress.city || "" : "",
        shippingState: userInfoQuery?.data?.data?.shippingAddress ? userInfoQuery?.data?.data?.shippingAddress.state || "" : "",
        shippingCountry: userInfoQuery?.data?.data?.shippingAddress ? userInfoQuery?.data?.data?.shippingAddress.country || "" : "",
        paymentMethods: userInfoQuery?.data?.data?.paymentMethods || [], // new state property for payment methods
        shippingCostPaidBy: userInfoQuery?.data?.data?.shippingCostPaidBy || "" // new state property for shipping cost payment
    });

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (name.startsWith('paymentMethod')) {
            // if the input name starts with "paymentMethod",
            // update the payment methods array in the formData state
            const a = target.name;
            const parts = a.split(".");
            const lastName = parts[1];

            const index = parseInt(name.substring('paymentMethod'.length));
            const paymentMethods = [...formData.paymentMethods];
            paymentMethods[index] = { ...paymentMethods[index], [lastName]: target.value };
            setFormData({
                ...formData,
                paymentMethods,
            });
        }
        else if (name === 'shippingCostPaidBy') {
            setFormData({
                ...formData,
                'shippingCostPaidBy': target.value
            });
        }
        else {
            // otherwise, update the corresponding input value in the formData state
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleRemovePaymentMethod = (index) => {
        const paymentMethods = [...formData.paymentMethods];
        paymentMethods.splice(index, 1); // Remove the item at the specified index
        setFormData({
            ...formData,
            paymentMethods,
        });
    };

    const handlePost = () => {
        let hasError = false; // Flag variable to track if an error occurred

        if (formData.name === '') {
            toast.error('Name can not be empty');
            hasError = true;
        }
        if (formData.city === '') {
            toast.error('City can not be empty');
            hasError = true;
        }

        formData.paymentMethods.forEach((element) => {
            if (element.name === '' || element.accountNo === '') {
                toast.error('Payment fields can not be empty');
                hasError = true;
            }
        });

        if (!hasError) {
            userEditMutation.mutate(formData)
        }
    }

    const copyDeliveryToShipping = () => {
        setFormData({
            ...formData,
            shippingAddressLine1: formData.deliveryAddressLine1,
            shippingAddressLine2: formData.deliveryAddressLine2,
            shippingPostalCode: formData.deliveryPostalCode,
            shippingCity: formData.deliveryCity,
            shippingState: formData.deliveryState,
            shippingCountry: formData.deliveryCountry,
        });
    }

    return (
        <div className='flex justify-center'>
            <div className='flex flex-col xsm:w-[90%] sm:w-[90%] xsm:text-[1rem] sm:text-[1rem] text-[1.2rem] w-[80%] xsm:gap-[0.6875em] sm:gap-[0.6875em] gap-[1em] justify-center mt-[20px]'>
                <div className='flex w-full flex-col gap-[0.5em]'>
                    <label className='text-[0.75em] font-[600]' htmlFor="name">Full Name</label>
                    <input name='name'
                        value={formData.name}
                        onChange={handleInputChange}
                        type="text" className='text-[0.75em] pl-[5px] ml-[0.625em] w-[40%] placeholder:font-[500]  border-[1px] border-[#595959]  xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' />
                </div>
                <div className='flex w-full flex-col gap-[0.5em]'>
                    <label className='text-[0.75em] font-[600]' htmlFor="Listing">Listing in</label>
                    <div className='ml-[0.5em] w-full'>
                        <ReactFlagsSelect
                            selected={formData.country}
                            name='country'
                            fullWidth={true}
                            searchable={true}
                            alignOptionsToRight={true}
                            onSelect={(code) => {
                                setFormData({
                                    ...formData,
                                    "country": code
                                });
                            }}
                            className='w-[40%] xsm:h-[25px] sm:h-[25px] h-[2.938em]  flex text-[0.75em] border-[1px] justify-start items-center bg-[#ffffff] border-[#595959]  rounded-[2px]  mt-[-4px] text-text font-sans'
                            placeholder="Choose a country"
                        />
                    </div>
                </div>
                <div className='flex w-full flex-col gap-[0.5em]'>
                    <label className='text-[0.75em] font-[600]' htmlFor="name">City</label>
                    <input name='city'
                        value={formData.city}
                        onChange={handleInputChange}
                        type="text" className='text-[0.75em] pl-[5px] ml-[0.625em] w-[40%] placeholder:font-[500]  border-[1px] border-[#595959]  xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' />
                </div>
                <div className='flex w-full flex-col gap-[0.5em]'>
                    <label className='text-[0.75em] font-[600]' htmlFor="Delievery Address">Delivery Address (Recieving to)</label>
                    <input
                        name='deliveryAddressLine1'
                        value={formData.deliveryAddressLine1}
                        onChange={handleInputChange} type="text" className='text-[0.75em] pl-[5px] ml-[0.625em] xsm:w-[80%] sm:w-[80%] w-full placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Address line 1' />
                    <input name='deliveryAddressLine2'
                        value={formData.deliveryAddressLine2}
                        onChange={handleInputChange} type="text" className='text-[0.75em] pl-[5px] ml-[0.625em] xsm:w-[80%] sm:w-[80%] w-full placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Address line 2' />
                    <div className='flex ml-[0.425em] xsm:w-[80%] sm:w-[80%] w-full gap-[0.9375em]'>
                        <input
                            name='deliveryPostalCode'
                            value={formData.deliveryPostalCode}
                            onChange={handleInputChange} type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Postal Code' />
                        <input name='deliveryCity'
                            value={formData.deliveryCity}
                            onChange={handleInputChange}
                            type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='City' />
                    </div>
                    <div className='flex ml-[0.425em] xsm:w-[80%] sm:w-[80%] w-full gap-[0.9375em]'>
                        <input name='deliveryState'
                            value={formData.deliveryState}
                            onChange={handleInputChange} type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='State / Province' />
                        <input name='deliveryCountry'
                            value={formData.deliveryCountry}
                            onChange={handleInputChange} type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Country' />
                    </div>
                </div>
                <div className='flex w-full flex-col gap-[0.5em]'>
                    <label className='text-[0.75em]  font-[600] flex items-center gap-[5px]' htmlFor="Shipping Address">Shipping Address (Sending from) <span className='text-[0.6em] cursor-pointer hover:underline hover:text-text text-[#595959BF] font-[500]' onClick={copyDeliveryToShipping}>Copy delivery address</span></label>
                    <input
                        name='shippingAddressLine1'
                        value={formData.shippingAddressLine1}
                        onChange={handleInputChange} type="text" className='text-[0.75em] pl-[5px] ml-[0.625em] xsm:w-[80%] sm:w-[80%] w-full placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Address line 1' />
                    <input name='shippingAddressLine2'
                        value={formData.shippingAddressLine2}
                        onChange={handleInputChange} type="text" className='text-[0.75em] pl-[5px] ml-[0.625em] xsm:w-[80%] sm:w-[80%] w-full placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Address line 2' />
                    <div className='flex ml-[0.425em] xsm:w-[80%] sm:w-[80%] w-full gap-[0.9375em]'>
                        <input
                            name='shippingPostalCode'
                            value={formData.shippingPostalCode}
                            onChange={handleInputChange} type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Postal Code' />
                        <input name='shippingCity'
                            value={formData.shippingCity}
                            onChange={handleInputChange}
                            type="text" className='text-[0.75em] w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='City' />
                    </div>
                    <div className='flex ml-[0.425em] xsm:w-[80%] sm:w-[80%] w-full gap-[0.9375em]'>
                        <input name='shippingState'
                            value={formData.shippingState}
                            onChange={handleInputChange} type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='State / Province' />
                        <input name='shippingCountry'
                            value={formData.shippingCountry}
                            onChange={handleInputChange} type="text" className='text-[0.75em]   w-[50%] pl-[5px] placeholder:font-[500] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[2.938em] rounded-[2px]' placeholder='Country' />
                    </div>
                </div>

                <div className='flex gap-[0.7em] mt-[0.3125em] flex-col'>
                    <label className='text-[0.75em] font-[600] flex items-center gap-[5px]' htmlFor="Shipping Address">Who pays shipping?</label>
                    <div className='flex gap-[1em]'>
                        <div className=' flex items-center gap-[6px]'>
                            <input
                                id="Buyer"
                                name='shippingCostPaidBy'
                                type="checkbox"
                                checked={formData.shippingCostPaidBy === 'Buyer'}
                                onChange={handleInputChange}
                                value="Buyer"
                                className="peer/published w-[18px] h-[18px] border border-gray-400 rounded-md bg-white checked:bg-transparent focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black"
                            />
                            <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[12px] font-[700]'>Buyer</p>
                        </div>
                        <div className='flex items-center gap-[6px]'>
                            <input
                                id="Me"
                                name='shippingCostPaidBy'
                                type="checkbox"
                                onChange={handleInputChange}
                                checked={formData.shippingCostPaidBy === 'Me'}
                                value="Me"
                                className="peer/published w-[18px] h-[18px] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black"
                            />
                            <span className='peer-checked/published:text-[#000000] inline-flex text-[#AAAAAA] text-[12px] font-[700]'>Me</span>
                        </div>
                    </div>
                </div>
                <div className='flex w-full flex-col gap-[0.6em] mt-[10px]'>
                    <label className='text-[0.75em] font-[600]' htmlFor="Payment Methods">Payment methods</label>
                    {formData.paymentMethods.map((paymentMethod, index) => (
                        <div key={index} className='flex gap-[0.75em]'>
                            <div className='flex w-[70%] flex-col gap-[0.75em]'>
                                <input value={paymentMethod.name} rows={5} name={`paymentMethod${index}.name`} id={index} className='name resize-none text-[0.75em] pl-[5px] ml-[0.625em] w-[80%] placeholder:font-[500] border-[1px] border-[#595959] rounded-[2px] xsm:h-[27px] sm:h-[27px] h-[2.938em]' placeholder={`For example "Swish" or "Bank transaction"`} onChange={handleInputChange} />
                                <textarea rows={3} value={paymentMethod.accountNo} name={`paymentMethod${index}.accountNo`} className='accountNo text-[0.75em] p-[5px] ml-[0.625em] resize-none w-full placeholder:font-[500] border-[1px] border-[#595959] rounded-[2px]' placeholder='Ad a description to your payment method, like phone number, account number or other relevant information' onChange={handleInputChange} />
                            </div>
                            <div className='flex justify-center w-[30%] items-center'><button className='h-[1.875em] w-[1.875em] bg-[#F21111] flex justify-center items-center' onClick={() => handleRemovePaymentMethod(index)}><img src={cross} alt="" /></button></div>
                        </div>
                    ))}
                    <div className=' flex gap-[0.625em]  justify-center' >
                        <button onClick={() => setFormData({ ...formData, paymentMethods: [...formData.paymentMethods, { name: '', accountNo: '' }] })} className='h-[1.875em] w-[1.875em] bg-primary flex justify-center items-center'><img src={add} alt="" /></button>
                    </div>
                </div>

                <div className='flex justify-center my-[0.625em] gap-[0.625em]'>
                    <button onClick={handlePost} className='buttonAnimation relative text-[#ffffff] mt-[0.45em] mb-[0.625em] button rounded-[2px] text-[.75em] font-[600] py-[0.625em] px-[2.1875em] bg-primary'>{userEditMutation.isLoading ?
                        <FaSpinner
                            className="animate-spin absolute inset-0 m-auto"
                            style={{ width: "1em", height: "1em", fontSize: '0.75em' }}
                        />
                        : 'Save'}</button>
                    <button onClick={() => navigate('/profile/private')} className='text-[#ffffff] mt-[0.45em] mb-[0.625em] button rounded-[2px] text-[.75em] font-[600] py-[0.625em] px-[2.1875em] bg-[#F21111]'>Discard</button>
                </div>
            </div>
        </div>
    )
}

export default PrivateInfoEdit