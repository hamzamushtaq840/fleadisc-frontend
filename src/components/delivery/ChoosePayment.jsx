import React, { useState } from 'react'
import addd from '../../assets/addd.svg';
import cross from '../../assets/cross.svg';
import { toast } from 'react-toastify';


const ChoosePayment = ({ seller, setModel, paymentMethod }) => {
    const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([]);
    const [add, setAdd] = useState(false)
    const [inputValues, setInputValues] = useState({});

    // Function to handle checkbox change
    const handleCheckboxChange = (method) => {
        if (method === "add") {
            if (inputValues.name === undefined || inputValues.name === "" && !selectedPaymentMethods.some((item) => { return item.id === 0 })) {
                toast.error("Please enter payment method name");
                return
            }
            if (inputValues.accountNo === undefined || inputValues.accountNo === "" && !selectedPaymentMethods.some((item) => { return item.id === 0 })) {
                toast.error("Please enter payment account number");
                return
            }

            if (selectedPaymentMethods.some((item) => { return item._id === 0 })) {
                const abc = selectedPaymentMethods.filter(item => { return item._id !== 0 });
                setSelectedPaymentMethods(abc);
                return
            }
            setSelectedPaymentMethods([...selectedPaymentMethods, inputValues])
        } else {
            const isMethodSelected = selectedPaymentMethods.includes(method);
            if (!isMethodSelected) {
                setSelectedPaymentMethods([...selectedPaymentMethods, method]);
            } else {
                setSelectedPaymentMethods(selectedPaymentMethods.filter(item => item !== method));
            }
        }
    }

    // Function to handle input change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (selectedPaymentMethods.some((item) => item.id === 0)) {
            setSelectedPaymentMethods(prevMethods => {
                return prevMethods.map(item => {
                    if (item.id === 0) {
                        return {
                            ...item,
                            selected: false,
                            [name]: value,
                        };
                    }
                    return item;
                });
            });
        }
        setInputValues((prev) => {
            return {
                ...prev,
                _id: 0,
                selected: false,
                [name]: value,
            }
        });
    }

    // Function to handle confirm button click
    const handleConfirm = () => {
        if (selectedPaymentMethods.length === 0) {
            toast.error("Please select at least one payment method");
            return
        }
        let seletedPayment = selectedPaymentMethods.map(item => {
            return { ...item, selected: false }
        });

        paymentMethod(seletedPayment);
        setModel(false);
    }

    return (
        <>
            <div className='modalBackground' onClick={() => setModel(false)}></div>
            <div className='modalContainer xsm:text-[1rem] sm:text-[1rem] text-[1.25rem] sm:w-[80%] xsm:w-[80%] w-[40%] flex flex-col justify-center items-center'>
                <h1 className='text-[1.25em] my-[0.925em]'>Choose Payment Method</h1>
                <div className='flex flex-col items-start w-[80%]'>
                    {seller.paymentMethods.length === 0 ?
                        (!add && <h1 className='flex mt-[0.625em] text-center p-[0.625em] text-[0.75em]'>No payment method found</h1>) :
                        (seller.paymentMethods.map((method, index) => {
                            const isChecked = selectedPaymentMethods.includes(method);
                            return (
                                <div key={index} className='flex gap-[0.75em] justify-center items-center'>
                                    <input type='checkbox' className='w-[1em] h-[.9em]' name='paymentMethod' checked={isChecked} onChange={() => handleCheckboxChange(method)} />
                                    <div className='flex flex-col'>
                                        <label className='text-[0.85em] font-[600]'>{method.name}</label>
                                        <label className='text-[0.75em] font-[400]'>{method.accountNo}</label>
                                    </div>
                                </div>
                            )
                        }))}
                </div>

                <div className='flex flex-col gap-[0.625em]  my-[1.2375em] items-center w-full' >
                    {add &&
                        <div className='flex w-[90%] items-center gap-[0.75em]'>
                            <input
                                type="checkbox"
                                className="w-[1em] h-[1em]"
                                name="paymentMethod"
                                checked={selectedPaymentMethods.some((item) => { return item._id === 0 })}
                                onChange={() => handleCheckboxChange("add")}
                            />
                            <div className='flex w-full flex-col gap-[0.75em]'>
                                <input
                                    name="name"
                                    className="text-[0.75em] resize-none p-[5px] ml-[0.625em] w-[70%] placeholder:font-[500]  border-[1px] border-[#595959] rounded-[2px] xsm:h-[27px] sm:h-[27px] h-[2.938em] "
                                    placeholder={`For example "Swish" or "Bank transaction"`}
                                    onChange={handleInputChange}
                                />
                                <textarea
                                    name="accountNo"
                                    rows={4}
                                    className="text-[0.75em] pl-[5px] ml-[0.625em] w-[70%] placeholder:font-[500]  border-[1px] border-[#595959]  rounded-[2px]"
                                    placeholder="Ad a description to your payment method, like phone number, account number or other relevant information"
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    }
                    <div className='flex my-[1.25em] gap-[10px]'>
                        {!add && <button onClick={() => setAdd(true)} className='h-[2.1em] w-[2em] buttonAnimation rounded-[4px] bg-primary flex justify-center items-center'><img src={addd} alt="" /></button>}
                        {add && <button onClick={() => {
                            if (selectedPaymentMethods.some((item) => { return item._id === 0 })) {
                                const abc = selectedPaymentMethods.filter(item => { return item._id !== 0 });
                                setSelectedPaymentMethods(abc);
                            }
                            setAdd(false)
                        }} className='h-[2.1em] w-[2em]  buttonAnimation rounded-[4px] bg-[#F21111] flex justify-center items-center'><img src={cross} alt="" /></button>}
                        <button onClick={handleConfirm} className='py-[0.625em] buttonAnimation rounded-[4px] text-[.75em] px-[2.813em] text-[#ffffff] bg-primary'>Confirm</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChoosePayment