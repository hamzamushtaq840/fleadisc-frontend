import React, { useState } from 'react'
import arrowdown from '../../assets/arrowdown.svg'
import grams from '../../assets/grams.svg'
import info from '../../assets/info.svg'
import plastic from '../../assets/plastic.svg'
import { getCountryInfoByISO } from '../../utils/iso-country-currency'
import upload from './../../assets/upload.svg'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CropEasy from './cropEasy'
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { Storage } from './../../utils/firebase'
import { useMutation, useQuery } from '@tanstack/react-query'
import axios from '../../api/axios'
import { FaSpinner } from 'react-icons/fa'
import CreatableSelect from 'react-select/creatable';
import useAuth from '../../hooks/useAuth'
import CancelModel from './CancelModel'

//will be in global auth of user 
const userCountry = 'PK'
const countryInfo = getCountryInfoByISO(userCountry);
const ranges = [
    { condition: 0, info: "The disc is in pieces and/or has holes in it." },
    { condition: 1, info: "Major cracks or the disc's original shape partially worn off" },
    { condition: 2, info: "The disc has cracks or is significantly warped or worn" },
    { condition: 3, info: "The disc is at the end of its life, with the design almost worn off, warped after a few solid tree/rock hits" },
    { condition: 4, info: "Well-used disc, possibly slightly warped, but still usable" },
    { condition: 5, info: "Used disc, but not warped, with some light scratches and some dents" },
    { condition: 6, info: "Broken in with minor damage, but still in good condition" },
    { condition: 7, info: "Barely broken in, used a few rounds without significant damage" },
    { condition: 8, info: "Test-thrown without direct damage, only minor scratches" },
    { condition: 9, info: "Unused, but may have some minor scratches from handling/storage, marked with a name/decal on the bottom" },
    { condition: 10, info: "\"Mint\", no scratches/damage" },
    { condition: 11, info: "In unopened original packaging" },
]

const Edit = () => {
    const location = useLocation()
    const data = location.state
    const navigate = useNavigate()
    const [optional, setOptional] = useState(false);
    const [openCrop, setOpenCrop] = useState(false)
    const [photoURL, setPhotoURL] = useState(data.pictureURL);
    const [files, setFile] = useState(null)
    const [model, setModel] = useState(false)
    const [inputValues, setInputValues] = useState({
        discId: data._id,
        pictureURL: data.pictureURL,
        quantity: data.quantity,
        discName: data.discName,
        brand: data.brand,
        range: data.range,
        condition: data.condition,
        plastic: data.plastic,
        grams: data.grams,
        named: data.named,
        dyed: data.dyed,
        blank: data.blank,
        glow: data.glow,
        collectible: data.collectible,
        firstRun: data.firstRun,
        priceType: data.priceType,
        startingPrice: data.startingPrice,
        minPrice: data.minPrice,
        endDay: data.endDay,
        endTime: data.endTime,
    });
    const { auth } = useAuth()
    const brandQuery = useQuery(['getBrand', auth.userId], () => axios.get(`/disc/getBrand`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });
    let options = brandQuery?.data?.data

    const handleOptionalChange = (event) => {
        if (event.target.name === 'priceType') {
            setInputValues((prevInputValues) => ({
                ...prevInputValues,
                [event.target.name]: event.target.id,
            }));
            return
        }
        if (event.target.type === 'checkbox' && event.target.name !== 'priceType') {
            const { name, type, checked, value } = event.target;
            const newValue = type === 'checkbox' ? checked : value;
            setInputValues((prevInputValues) => ({
                ...prevInputValues,
                [name]: newValue,
            }));
            return
        }
        setInputValues((prevInputValues) => ({
            ...prevInputValues,
            [event.target.name]: event.target.value,
        }));
    };

    const handleCondition = (range2) => {
        setInputValues((prevInputValues) => ({
            ...prevInputValues,
            "condition": range2,
        }));
    };

    const handleUpload = async (file) => {
        try {
            const uniqueFileName = `${file.name}_${Math.random().toString(36).substring(2)}`;
            const storageRef = ref(Storage, `/courseImages/${uniqueFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            const url = await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    },
                    (error) => {
                        console.log(error);
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref)
                            .then((url) => {
                                resolve(url);
                            })
                            .catch((error) => {
                                console.log(error);
                                reject(error);
                            });
                    }
                );
            });
            return url;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    const editDisc = useMutation(() => axios.post(`/disc/edit/${data._id}`, inputValues), {
        onSuccess: () => {
            navigate('/profile/private/listings')
            toast.success('Listing edited successfully');
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handlePublish = async (e) => {
        e.preventDefault()
        if (inputValues.quantity === '') {
            toast.error('Quantity is required')
            return
        }
        if (inputValues.discName === '') {
            toast.error('Disc Name is required')
            return
        }
        if (inputValues.brand === '') {
            toast.error('Brand is required')
            return
        }
        if (inputValues.range === '') {
            toast.error('Range is required')
            return
        }
        if (inputValues.priceType === 'auction' && inputValues.startingPrice === '') {
            toast.error('Starting price is required')
            return
        }
        if (inputValues.priceType === 'fixedPrice' && inputValues.startingPrice === '') {
            toast.error('Price is required')
            return
        }
        if (inputValues.priceType === 'auction' && inputValues.endDay === '') {
            toast.error('End day is required')
            return
        }
        if (inputValues.priceType === 'auction' && inputValues.endTime === '') {
            toast.error('End time is required')
            return
        }
        if (inputValues.pictureURL === null) {
            toast.error('Please add a picture')
            return
        }
        if (inputValues.pictureURL instanceof Blob) {
            const photo = await handleUpload(inputValues.pictureURL)
            setInputValues((prevInputValues) => ({
                ...prevInputValues,
                pictureURL: photo,
            }))
        }
        if (inputValues.priceType === 'auction' && inputValues.minPrice === '') {
            setInputValues((prev) => {
                return {
                    ...prev,
                    minPrice: 1
                }
            })
        }
        if (inputValues.priceType === 'fixedPrice') {
            setInputValues((prevInputValues) => ({
                ...prevInputValues,
                endDay: '',
                endTime: ''
            }))
        }
        // console.log(inputValues);
        editDisc.mutate()
    }

    async function convertHeicToJpeg(heicBlob) {
        const jpegBlob = await heic2any({
            blob: heicBlob,
            toType: 'image/jpeg',
            quality: 0.92 // Optional: set the JPEG quality (default is 0.92)
        });

        return jpegBlob;
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (file.type === 'image/heic') {
            const jpegBlob = await convertHeicToJpeg(file);
            setFile(jpegBlob);
            setPhotoURL(URL.createObjectURL(jpegBlob));
        } else {
            setFile(file);
            setPhotoURL(URL.createObjectURL(file));
        }
        setOpenCrop(true)
    }

    const handleCropped = (file, url) => {
        setPhotoURL(url)
        inputValues.pictureURL = file;
    }

    const dontCrop = (url) => {
        setPhotoURL(url)
        inputValues.pictureURL = files;
    }

    return (
        <div >
            <div style={{ minHeight: "calc(100vh - 88px)", scrollBehavior: "smooth" }} className='relative left-1/2 sm:text-[1rem] xsm:text-[1rem] text-[1.2rem] -translate-x-1/2 mr-[50px] max-w-[1300px] mt-[0.5em]'>
                <div className='flex justify-between mb-[1.2em] xsm:my-[0.9375em] sm:my-[0.9375em] w-full items-center'>
                    <h1 className='font-[700] text-[1.25em]'>Edit</h1>
                </div>
                <div className='bg-[#FFFFFF] rounded-[8px] pb-[2.5em] px-[1.25em] xsm:px-[0] sm:px-[0] border-[#0000001f] border-[0.5px]'>
                    <div className="flex justify-center items-center px-[0.625em] h-[13.6875em]">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            {photoURL !== null ? (
                                <img src={photoURL} className='w-full h-[12.5em] rounded-[4px]' alt="uploaded picture" />
                            ) : (
                                <img src={upload} className='w-[84px]' alt="upload a picture" />
                            )}
                        </label>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} />
                    </div>
                    <div className=' border-[0.5px] border-[#0000002e] mb-[0.875em]'></div>
                    <div>
                        <label htmlFor="Qty" className='text-[0.75em] ml-[1em] text-[#595959] font-[700]'>Qty :<input name='quantity'
                            value={inputValues.quantity}
                            onChange={handleOptionalChange} type="number" min='1' className='ml-[0.5em] pl-[0.325em] border-[1px] h-[1.25em] rounded-[2px] w-[2.8125em]' /></label>
                    </div>
                    <div className='flex justify-end mb-[0.1875em]'>
                        <div className='w-[50%] flex pl-[0.625em] items-center'>
                            <h1 className='font-sans text-[#595959] text-[0.75em] font-[700] mr-[0.625em]'>Condition*</h1>
                            <img src={info} className='w-[0.5206em]' alt="information" />
                        </div>
                    </div>

                    <div className='px-[0.8em] flex'>
                        <div className='w-[50%] flex flex-col gap-[0.8625em] xsm:gap-[0.5625em] sm:gap-[0.5625em] mr-[0.625em]'>
                            <input name='discName'
                                value={inputValues.discName}
                                onChange={handleOptionalChange} type="text" className='text-[0.75em] placeholder:font-[500] pl-[7px] border-[1px] border-[#595959] xsm:h-[23px] sm:h-[23px] h-[1.938em] rounded-[2px]' placeholder='Disc Name *' />
                            <CreatableSelect
                                isClearable
                                value={options?.find((option) => option.value === inputValues.brand) || null}
                                className="select2 w-full text-[0.75em] font-[500] text-[#AAAAAA] rounded-[2px] outline-none leading-[14.63px] bg-[white]"
                                closeMenuOnScroll={true}
                                placeholder="Brand"
                                options={options}
                                onChange={(selectedOption) => {
                                    setInputValues((prevInputValues) => ({
                                        ...prevInputValues,
                                        brand: selectedOption ? selectedOption.value : '',
                                    }));
                                }}
                                onCreateOption={(inputValue) => {
                                    const newOption = { value: inputValue, label: inputValue };
                                    options?.push(newOption);
                                    setInputValues((prevInputValues) => ({
                                        ...prevInputValues,
                                        brand: newOption.value,
                                    }));
                                }}
                            />
                            <select name='range' value={inputValues.range} onChange={handleOptionalChange} className="w-full text-[0.75em] bg-white border-[1px] border-[#595959] placeholder:font-[500] px-[1px] rounded-[2px] xsm:h-[23px] sm:h-[23px] h-[1.938em]" placeholder="Range *">
                                <option selected value='range'>Range</option>
                                <option value='Putt & Approach'>Putt & Approach</option>
                                <option value='Midrange'>Midrange</option>
                                <option value='Fairway drivers'>Fairway drivers</option>
                                <option value='Distance Drivers'>Distance Drivers</option>
                            </select>
                        </div>
                        <div className="w-[50%] grid grid-cols-4 xsm:gap-x-2 sm:gap-x-2 gap-x-10 xsm:gap-y-[0.375em] sm:gap-y-[0.375em] gap-y-[0.675em]">
                            {ranges.map((value, index) => (
                                <div key={index} className={`abc flex justify-center items-center rounded-full px-[8px] py-[3px] ${inputValues.condition === value.condition ? 'bg-[#81b29a2f]' : ''} border border-[#595959] cursor-pointer`} onClick={() => handleCondition(value.condition)}>
                                    <span className="text-[12px] absolute"><div data-title={value.info} className="helpDiv relative">{value.condition}</div></span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <span onClick={() => setOptional((prev) => !prev)} className='inline-flex text-[0.75em] mt-[18px] ml-[1em] text-[#595959] font-[700]'>Optional details <img className={`ml-[7px] transform ${optional ? 'rotate-180' : ''}`} src={arrowdown} /></span>
                    {optional &&
                        <div className='px-[0.8em] mt-[0.5625em] flex flex-wrap mb-[1.25em]'>
                            <div className='flex w-full'>
                                <div className='flex w-[50%] items-center gap-[0.375em]'>
                                    <img src={plastic} className="h-[20px]" alt="plastic" />
                                    <input name='plastic'
                                        value={inputValues.plastic}
                                        onChange={handleOptionalChange} type="text" className='border rounded-[2px] w-full mr-[20px]  text-[.75em] placeholder:font-[500] pl-[8px]' placeholder='Plastic...' />
                                </div>
                                <div className='flex w-[50%] items-center gap-[0.375em]'>
                                    <img src={grams} className="h-[20px]" alt="plastic" />
                                    <input name='grams'
                                        value={inputValues.grams}
                                        onChange={handleOptionalChange} type="number" className='border rounded-[2px] w-[50%] text-[.75em] placeholder:font-[500] pl-[8px]' placeholder='Grams' />
                                </div>
                            </div>
                            <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                                <input name='named'
                                    checked={inputValues.named}
                                    onChange={handleOptionalChange} id='named' type="checkbox" className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                                <svg width="18" height="18" className='peer-checked/published:fill-[#000000] fill-[#AAAAAA]'><path d="M0 15.6V18h18v-2.4H0Zm5.786-5.04h6.428l1.157 2.64h2.7L9.964 0H8.036L1.929 13.2h2.7l1.157-2.64ZM9 2.376 11.404 8.4H6.596L9 2.376Z" /></svg>
                                <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Named</p>
                            </div>
                            <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                                <input
                                    id='dyed'
                                    name='dyed'
                                    checked={inputValues.dyed}
                                    onChange={handleOptionalChange} type="checkbox" className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                                <svg width="20" height="20" className='peer-checked/published:fill-[#000000] fill-[#AAAAAA] '><path d="M16.1111 10C15.6691 10 15.2452 9.82441 14.9326 9.51185C14.62 9.19928 14.4444 8.77536 14.4444 8.33333C14.4444 7.89131 14.62 7.46738 14.9326 7.15482C15.2452 6.84226 15.6691 6.66667 16.1111 6.66667C16.5531 6.66667 16.9771 6.84226 17.2896 7.15482C17.6022 7.46738 17.7778 7.89131 17.7778 8.33333C17.7778 8.77536 17.6022 9.19928 17.2896 9.51185C16.9771 9.82441 16.5531 10 16.1111 10ZM12.7778 5.55556C12.3358 5.55556 11.9118 5.37996 11.5993 5.0674C11.2867 4.75484 11.1111 4.33092 11.1111 3.88889C11.1111 3.44686 11.2867 3.02294 11.5993 2.71038C11.9118 2.39782 12.3358 2.22222 12.7778 2.22222C13.2198 2.22222 13.6437 2.39782 13.9563 2.71038C14.2689 3.02294 14.4444 3.44686 14.4444 3.88889C14.4444 4.33092 14.2689 4.75484 13.9563 5.0674C13.6437 5.37996 13.2198 5.55556 12.7778 5.55556ZM7.22222 5.55556C6.7802 5.55556 6.35627 5.37996 6.04371 5.0674C5.73115 4.75484 5.55556 4.33092 5.55556 3.88889C5.55556 3.44686 5.73115 3.02294 6.04371 2.71038C6.35627 2.39782 6.7802 2.22222 7.22222 2.22222C7.66425 2.22222 8.08817 2.39782 8.40073 2.71038C8.71329 3.02294 8.88889 3.44686 8.88889 3.88889C8.88889 4.33092 8.71329 4.75484 8.40073 5.0674C8.08817 5.37996 7.66425 5.55556 7.22222 5.55556ZM3.88889 10C3.44686 10 3.02294 9.82441 2.71038 9.51185C2.39782 9.19928 2.22222 8.77536 2.22222 8.33333C2.22222 7.89131 2.39782 7.46738 2.71038 7.15482C3.02294 6.84226 3.44686 6.66667 3.88889 6.66667C4.33092 6.66667 4.75484 6.84226 5.0674 7.15482C5.37996 7.46738 5.55556 7.89131 5.55556 8.33333C5.55556 8.77536 5.37996 9.19928 5.0674 9.51185C4.75484 9.82441 4.33092 10 3.88889 10ZM10 0C7.34784 0 4.8043 1.05357 2.92893 2.92893C1.05357 4.8043 0 7.34784 0 10C0 12.6522 1.05357 15.1957 2.92893 17.0711C4.8043 18.9464 7.34784 20 10 20C10.442 20 10.866 19.8244 11.1785 19.5118C11.4911 19.1993 11.6667 18.7754 11.6667 18.3333C11.6667 17.9 11.5 17.5111 11.2333 17.2222C10.9778 16.9222 10.8111 16.5333 10.8111 16.1111C10.8111 15.6691 10.9867 15.2452 11.2993 14.9326C11.6118 14.62 12.0358 14.4444 12.4778 14.4444H14.4444C15.9179 14.4444 17.3309 13.8591 18.3728 12.8173C19.4147 11.7754 20 10.3623 20 8.88889C20 3.97778 15.5222 0 10 0Z" /></svg>
                                <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Dyed</p>
                            </div>
                            <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                                <input name='blank'
                                    checked={inputValues.blank}
                                    onChange={handleOptionalChange} id='blank' type="checkbox" className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                                <svg width="20" height="20" className='peer-checked/published:fill-[#000000] fill-[#AAAAAA]'><path d="M10 0C4.47 0 0 4.47 0 10C0 15.53 4.47 20 10 20C15.53 20 20 15.53 20 10C20 4.47 15.53 0 10 0ZM10 18C5.59 18 2 14.41 2 10C2 5.59 5.59 2 10 2C14.41 2 18 5.59 18 10C18 14.41 14.41 18 10 18Z" /></svg>
                                <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Blank</p>
                            </div>
                            <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                                <input name='glow'
                                    checked={inputValues.glow}
                                    onChange={handleOptionalChange} id='glow' type="checkbox" className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                                <svg width="20" height="20" className='peer-checked/published:fill-[#000000] fill-[#AAAAAA]'><path d="M10 4.54545C11.4466 4.54545 12.834 5.12013 13.8569 6.14305C14.8799 7.16598 15.4545 8.55336 15.4545 10C15.4545 12.0182 14.3545 13.7818 12.7273 14.7273V16.3636C12.7273 16.6047 12.6315 16.836 12.461 17.0065C12.2905 17.177 12.0593 17.2727 11.8182 17.2727H8.18182C7.94071 17.2727 7.70948 17.177 7.53899 17.0065C7.36851 16.836 7.27273 16.6047 7.27273 16.3636V14.7273C5.64545 13.7818 4.54545 12.0182 4.54545 10C4.54545 8.55336 5.12013 7.16598 6.14305 6.14305C7.16598 5.12013 8.55336 4.54545 10 4.54545ZM11.8182 18.1818V19.0909C11.8182 19.332 11.7224 19.5632 11.5519 19.7337C11.3814 19.9042 11.1502 20 10.9091 20H9.09091C8.8498 20 8.61857 19.9042 8.44808 19.7337C8.2776 19.5632 8.18182 19.332 8.18182 19.0909V18.1818H11.8182ZM17.2727 9.09091H20V10.9091H17.2727V9.09091ZM0 9.09091H2.72727V10.9091H0V9.09091ZM10.9091 0V2.72727H9.09091V0H10.9091ZM3.56364 2.27273L5.5 4.21818L4.20909 5.5L2.27273 3.57273L3.56364 2.27273ZM14.5 4.20909L16.4273 2.27273L17.7273 3.57273L15.7909 5.5L14.5 4.20909Z" /></svg>
                                <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Glow</p>
                            </div>
                            <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                                <input name='collectible'
                                    checked={inputValues.collectible}
                                    onChange={handleOptionalChange} id='collectible' type="checkbox" className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                                <svg width="18" height="18" className='peer-checked/published:fill-[#000000] fill-[#AAAAAA]'><path d="M9 18L7.695 16.7052C3.06 12.1243 0 9.103 0 5.3951C0 2.37384 2.178 0 4.95 0C6.516 0 8.019 0.794551 9 2.05014C9.981 0.794551 11.484 0 13.05 0C15.822 0 18 2.37384 18 5.3951C18 9.103 14.94 12.1243 10.305 16.715L9 18Z" /></svg>
                                <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Collectible</p>
                            </div>
                            <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                                <input name='firstRun'
                                    checked={inputValues.firstRun}
                                    onChange={handleOptionalChange} id='firstRun' type="checkbox" className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                                <svg width="20" height="20" className='peer-checked/published:fill-[#000000] fill-[#AAAAAA]'><path d="M12.2222 15.5556H10V6.66667H7.77778V4.44444H12.2222M17.7778 0H2.22222C1.63285 0 1.06762 0.234126 0.650874 0.650874C0.234126 1.06762 0 1.63285 0 2.22222V17.7778C0 18.3671 0.234126 18.9324 0.650874 19.3491C1.06762 19.7659 1.63285 20 2.22222 20H17.7778C18.3671 20 18.9324 19.7659 19.3491 19.3491C19.7659 18.9324 20 18.3671 20 17.7778V2.22222C20 1.63285 19.7659 1.06762 19.3491 0.650874C18.9324 0.234126 18.3671 0 17.7778 0Z" /></svg>
                                <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>First Run</p>
                            </div>
                        </div>}
                    <div className='flex flex-wrap px-[0.8em]'>
                        <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                            <input
                                id="auction"
                                name='priceType'
                                type="checkbox"
                                onChange={handleOptionalChange}
                                checked={inputValues.priceType === 'auction'}
                                className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                            <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Auction</p>
                        </div>
                        <div className='w-[50%] mt-[0.9375em] flex items-center gap-[0.375em]'>
                            <input
                                id='fixedPrice'
                                name='priceType'
                                type="checkbox"
                                onChange={handleOptionalChange}
                                checked={inputValues.priceType === 'fixedPrice'}
                                className="peer/published w-[1.125em] h-[1.125em] border border-gray-400 rounded-md bg-white checked:border-transparent checked:background-[#fffff] focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-black" />
                            <p className='peer-checked/published:text-[#000000] text-[#AAAAAA] text-[0.75em] font-[700]'>Fixed Price</p>
                        </div>
                    </div>
                    <div className='flex items-start gap-[0px] px-[0.8em]'>
                        <div className='w-[50%] pr-[0.625em] mt-[0.9375em] flex items-center'>
                            <input name='startingPrice'
                                value={inputValues.startingPrice}
                                onChange={handleOptionalChange} type="number" min={0} className='w-full text-[0.75em] h-[1.938em] placeholder:font-[500] pl-[0.4375em] border-[1px] font-sans border-[#595959] rounded-[2px]' placeholder={inputValues.priceType === 'auction' ? `Starting Price (Kr)` : "Price"} />
                        </div>
                        <div className='w-[50%] justify-start mt-[0.9375em] flex flex-col items-start'>
                            <input name='minPrice'
                                value={inputValues.minPrice}
                                onChange={handleOptionalChange} type="number" min={0} className={`w-full text-[0.75em] placeholder:font-[500] pl-[0.4375em] border-[1px] font-sans border-[#595959] h-[1.938em] rounded-[2px] ${inputValues.priceType !== 'auction' ? 'hidden' : ''}`} placeholder={`Min Price (Kr)`} />
                            <p className={`font-[400] text-[.6em] mt-[.2em] text-[#AAAAAA] text-left ${inputValues.priceType !== 'auction' ? 'hidden' : ''}`}>1 SEK default</p>
                        </div>
                    </div>
                    {inputValues.priceType === 'auction' && <div className='flex flex-wrap mx-[0.8em] mt-[0.625em] gap-[0.625em] w-full'>
                        <div className='flex items-center font-[500]'>
                            <span className='mr-[0.3125em] text-[.75em]'>End time :</span>
                            <input name='endDay'
                                disabled
                                value={inputValues.endDay}
                                onChange={handleOptionalChange} className='text-[#595959bf] text-[.75em] rounded-[2px] border-[1px] border-[#000000]' id="data" type="date" placeholder='sss' />
                        </div>
                        <label htmlFor="time" className='text-[.75em] xsm:h-[1.25em] sm:h-[1.25em] h-[1.75em] font-[500]'>at<input name='endTime'
                            value={inputValues.endTime}
                            disabled
                            onChange={handleOptionalChange} className='min-w-[80px] ml-2 text-[#595959bf] rounded-[2px] border-[1px] border-[#000000]' type="time" id="time" /></label>
                    </div>}
                </div>
                <div className='flex justify-center mb-[20px] gap-[8px]'>
                    <button onClick={handlePublish} className='buttonAnimation relative w-[7.5em] h-[2.3125em] mt-[18px] text-[0.875rem] font-[600] bg-primary text-[#ffff] shadow-2xl rounded-[2px]' style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 6px 4px -1px rgba(0, 0, 0, 0.06)" }}>{editDisc.isLoading ?
                        <FaSpinner
                            className="animate-spin absolute inset-0 m-auto"
                            style={{ width: "1em", height: "1em", fontSize: '0.875em' }}
                        />
                        : "Update"}</button>
                    <button onClick={() => setModel(true)} className='buttonAnimation w-[7.5em] h-[2.3125em] mt-[18px] text-[0.875rem] font-[600] bg-[#F21111] text-[#ffff] shadow-2xl rounded-[2px]' style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 6px 4px -1px rgba(0, 0, 0, 0.06)" }}>Cancel</button>
                </div>
            </div >
            {openCrop && <CropEasy photoURL={photoURL} setOpenCrop={setOpenCrop} dontCrop={dontCrop} onFinish={handleCropped} />}
            {model && <CancelModel setModel={setModel} discId={data._id} />}
        </div >
    )
}

export default Edit

