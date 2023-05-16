import { useGoogleLogin } from '@react-oauth/google';
import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from '../api/axios';
import back from './../assets/back.svg';
import google from './../assets/google.svg';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa'

const Signup = () => {
    const navigate = useNavigate();
    const [registrationState, setRegistrationState] = useState({ name: '', email: '', password: '' })
    const { mutate, isLoading } = useMutation((formData) => {
        return axios.post('/user/checkEmail', formData);
    });

    const handleRegistrationChange = (e) => {
        setRegistrationState({ ...registrationState, [e.target.name]: e.target.value })
    }

    const handleRegistration = (e) => {
        e.preventDefault()
        mutate({ email: registrationState.email, from: 'simple' }, {
            onSuccess: () => {
                navigate('/signup/country', { state: { registrationState: registrationState, from: 'simple' } })
            },
            onError: (err) => {
                toast.error(err.response.data.message);
            },
        });
    }

    const register = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            mutate({ from: 'google', googleAccessToken: tokenResponse.access_token }, {
                onSuccess: () => {
                    navigate('/signup/country', { state: { from: 'google', googleAccessToken: tokenResponse.access_token } })
                },
                onError: (err) => {
                    toast.error(err.response.data.message);
                },
            });
            // navigate('/signup/country', { state: { registrationState: registrationState, from: 'google' } })
            // axios.post('/user/register', { googleAccessToken: tokenResponse.access_token })
            //     .then((res) => {
            //         if (res.status === 201)
            //             navigate('/signup/country', { state: registrationState })
            //     })
            //     .catch(e => console.log(e))
        },
        onError: errorResponse => console.log(errorResponse),
    });

    return (
        <div className='min-h-screen justify-center flex flex-col text-[1.2rem] sm:text-[1rem] xsm:text-[1rem]' data-ux_mode="redirect">
            <header><img src={back} alt="back button" onClick={() => navigate(-1)} className='hover:cursor-pointer p-[32px]' /></header>
            <div className='flex flex-1 sm:items-center md:items-center lg:items-center xl:items-center 2xl:items-center pb-[200px] flex-col mx-[46px] justify-center'>
                <h1 className='font-[700] max-w-[400px] font-sans leading-[39px] text-[1.55em] w-full'>Create account</h1>
                <div className='mt-[27px] max-w-[400px] flex flex-col items-center w-full'>
                    <button onClick={() => register()} className='border max-w-[600px] bg-[#FFFFFF] rounded-[4px] border-[#D9D9D9] p-[0.75em] w-full font-[500] text-[0.875em] flex items-center'>
                        <img src={google} alt="" />
                        <h1 className='flex-1 text-[0.875em]'>Sign up with Google</h1>
                    </button>
                    <p className='my-[11px] font-dmsans text-[8px] text-[#A5A5A5] flex justify-center'>OR</p>
                    <form className='flex flex-col gap-[7px] w-full items-center' onSubmit={handleRegistration}>
                        <input required type="text" className='p-[0.75em] max-w-[600px] w-full bg-[#F5F5F5] font-sans font-[500] text-[0.875em] border rounded-[4px] border-[#D9D9D9]' placeholder='Full Name' value={registrationState.name} name="name" onChange={handleRegistrationChange} />
                        <input required type="email" className='p-[0.75em] max-w-[600px] w-full bg-[#F5F5F5] font-sans font-[500] text-[0.875em] border rounded-[4px] border-[#D9D9D9]' placeholder='Email address' value={registrationState.email} name="email" onChange={handleRegistrationChange} />
                        <input required type="password" className='p-[0.75em] max-w-[600px] w-full bg-[#F5F5F5] font-sans font-[500] text-[0.875em] border rounded-[4px] border-[#D9D9D9]' placeholder='Password' value={registrationState.password} name="password" onChange={handleRegistrationChange} />
                        <div className='flex justify-center'>
                            <button type="submit" className='buttonAnimation relative w-[7.5em] h-[2.3125em] mt-[9px] text-[0.875em] font-[700] bg-primary text-[#ffff] shadow-2xl rounded-[6px]' style={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 6px 4px -1px rgba(0, 0, 0, 0.06)" }}>{isLoading ?
                                <FaSpinner className="animate-spin absolute inset-0 m-auto" style={{ fontSize: "0.875em" }} /> : "Sign Up"}</button>
                        </div>
                    </form>
                </div>
                <div className='mt-6 w-full max-w-[380px] h-[2px] bg-[#D9D9D9]'></div>
                <p className='mt-6 w-full text-center font-dmsans text-[.7em] text-[#A5A5A5] flex justify-center'>Already have an account?<span onClick={() => navigate('/signin')} className='font-dmsans text-[12px] text-[#A5A5A5] hover:underline font-bold hover:text-[#8ab4f8] pl-[4px] cursor-pointer'>Sign In.</span></p>
            </div>
        </div>
    )
}

export default Signup