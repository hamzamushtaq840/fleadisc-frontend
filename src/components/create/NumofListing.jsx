import React, { useState } from 'react'
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { Storage } from './../../utils/firebase'
import { toast } from 'react-toastify';
import axios from './../../api/axios';
import { FaSpinner } from 'react-icons/fa';

const NumofListing = ({ setModel, discs, clearForm }) => {
    const [isLoading, setIsLoading] = useState(false);

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

    const handlePublish = async () => {
        setIsLoading(true);
        try {
            const uploadPromises = [];
            for (let i = 0; i < discs.length; i++) {
                const disc = discs[i];
                if (disc.pictureURL) {
                    uploadPromises.push(handleUpload(disc.pictureURL));
                }
            }

            const urls = await Promise.all(uploadPromises);

            for (let i = 0; i < discs.length; i++) {
                const disc = discs[i];
                if (disc.pictureURL) {
                    disc.pictureURL = urls[i];
                }
            }

            discs[0].brandShouldAdd = true
            const promises = discs.map(async (disc, index) => {
                if (disc.priceType === 'auction' && disc.minPrice === '') {
                    disc.minPrice = 1;
                }
                if (disc.priceType === 'fixedPrice') {
                    disc.endDay = '';
                    disc.endTime = '';
                }
                for (let i = 0; i < index; i++) {
                    if (discs[i].brand === disc.brand) {
                        disc.brandShouldAdd = false
                        break
                    }
                    else {
                        disc.brandShouldAdd = true
                    }
                }
                try {
                    const { data } = await axios.post('/disc', disc);
                    return data;
                } catch (error) {
                    console.log(error);
                    throw error;
                }
            });

            const results = await Promise.all(promises);
            if (results) {
                toast.success(`${discs.length > 1 ? 'Discs' : 'Disc'} published successfully`);
                clearForm();
            }
            setIsLoading(false);
            setModel(false);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className='modalBackground' onClick={() => setModel(false)}></div>
            <div className='modalContainer xsm:text-[16px] sm:text-[16px] text-[20px] sm:h-[20%] sm:w-[70%] xsm:w-[70%] xsm:h-[20%] h-[30%] w-[40%] flex flex-col justify-center items-center'>
                <span className='text-[.75em] items-center flex font-[500]' >
                    No of Listing : &nbsp;
                    <h1 className='text-[.95em] mt-[1px] font-[800]'>{discs.length}</h1>
                </span>
                <div className='flex justify-center'><button className='buttonAnimation relative w-[10em] h-[2.3125em] mt-[10px] text-[0.750em] font-[600] bg-primary text-[#ffff] shadow-2xl rounded-[2px]' style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 6px 4px -1px rgba(0, 0, 0, 0.06)" }} onClick={handlePublish}>{isLoading ?
                    <FaSpinner
                        className="animate-spin absolute inset-0 m-auto"
                        style={{ width: "1em", height: "1em", fontSize: '0.750em' }}
                    />
                    : "Confirm Listing"}</button></div>
            </div>
        </>
    )
}

export default NumofListing