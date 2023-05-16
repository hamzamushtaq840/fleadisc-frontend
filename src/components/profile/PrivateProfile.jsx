import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import user from './../../assets/signin.svg'
import useAuth from '../../hooks/useAuth'
import Loader from '../Loader'
import axios from '../../api/axios'
import { useMutation, useQuery } from '@tanstack/react-query'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { Storage } from '../../utils/firebase'
import { toast } from 'react-toastify'

const PrivateProfile = () => {
    const navigate = useNavigate()
    const { auth, setAuth } = useAuth()

    const handleFileInputChange = async (event) => {
        const file = event.target.files[0];
        const photo = await handleUpload(file)
        pictureMutation.mutate({ pictureURL: photo, userId: auth.userId })
        setAuth({ ...auth, profilePicture: photo })
        console.log(auth);

    };

    const handleUpload = async (file) => {
        toast(0, { autoClose: false, toastId: 1 })
        try {
            const uniqueFileName = `${file.name}_${Math.random().toString(36).substring(2)}`;
            const storageRef = ref(Storage, `/courseImages/${uniqueFileName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);
            const url = await new Promise((resolve, reject) => {
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {
                        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        toast.update(1, {
                            // position: toast.POSITION.TOP_CENTER,
                            render: 'Uploading ' + p.toFixed(0) + '%',
                        });
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        console.log(error);
                        reject(error);
                    },
                    () => {
                        getDownloadURL(uploadTask.snapshot.ref)
                            .then((url) => {
                                resolve(url);
                                toast.update(1, {
                                    type: toast.TYPE.SUCCESS,
                                    render: 'File uploaded',
                                    autoClose: 1000
                                });
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

    const userInfoQuery = useQuery(['userData', auth.userId], () => axios.get(`/user/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const pictureMutation = useMutation((data) => axios.post('/user/profilePic', data), {
        onSuccess: () => {
            userInfoQuery.refetch()
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
            <div style={{ minHeight: "calc(100vh - 67px)", scrollBehavior: "smooth" }} className='mx-[2.575em] flex flex-col sm:mx-[1rem] xsm:mx-[0rem] xsm:pt-[20px] sm:pt-[20px] pt-[40px] text-[1.2rem] sm:text-[1rem] xsm:text-[1rem]'>
                <div className='flex justify-center'><img src={userInfoQuery.data.data.profilePicture !== null ? userInfoQuery.data.data.profilePicture : user} className="xsm:h-[8em] sm:h-[8em] md:h-[8em] lg:h-[8em] xl:h-[8em] 2xl:h-[8em] xsm:w-[8em] sm:w-[8em] md:w-[8em] lg:w-[8em] xl:w-[8em] 2xl:w-[8em] rounded-full" alt="user" /></div>
                <label htmlFor='fileInput' className='text-center text-[.65em] mt-[3px]'>
                    <span className='cursor-pointer hover:underline'>Change picture</span>
                    <input
                        id='fileInput'
                        type='file'
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />
                </label>
                <div className='flex justify-center'><button onClick={() => navigate('/profile/private/edit')} className='text-[#ffffff] mt-[0.45em] mb-[0.625em] button rounded-[2px] text-[.75em] font-[600] py-[0.625em] px-[2.1875em] bg-primary'>Edit</button></div>
                <div className='flex justify-center items-center mt-[10px] gap-[27px]'>
                    <NavLink to="/profile/private" className={({ isActive }) => isActive && (location.pathname === "/profile/private" || location.pathname === "/profile/private/edit") ? "active nav-link3 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000080]" : "nav-link3 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000080]"} >
                        <h1 className='text-[0.75em]'>Information</h1>
                    </NavLink>
                    <span>|</span>
                    <NavLink to="/profile/private/listings" className={({ isActive }) => isActive && location.pathname === "/profile/private/listings" ? "active nav-link3 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000080]" : "nav-link3 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000080]"} >
                        <h1 className='text-[0.75em]'>Listings</h1>
                    </NavLink>
                    <span>|</span>
                    <NavLink to="/profile/private/purchases" className={({ isActive }) => isActive && location.pathname === "/profile/private/purchases" ? "active nav-link3 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000080]" : "nav-link3 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000080]"} >
                        <h1 className='text-[0.75em]'>Purchases</h1>
                    </NavLink>
                </div>
                <Outlet />
            </div>
        )
}

export default PrivateProfile