import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from '../../api/axios'
import chatbackarrow from './../../assets/chatbackarrow.svg'
import imagesend from './../../assets/imagesend.svg'
import send from './../../assets/send.svg'
import user from './../../assets/signin.svg'
import useAuth from './../../hooks/useAuth'
import moment from 'moment';
import Loader from '../Loader'
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage"
import { Storage } from './../../utils/firebase'

const SingleChat = () => {
    const location = useLocation()
    let userId = '1'
    const { auth, socket } = useAuth()
    const client = useQueryClient()
    const navigate = useNavigate()
    const containerRef = useRef(null);
    const [message, setMessage] = useState('')
    const [id, setId] = useState('');
    let currentDay = '';

    const chats = useQuery(['singleChat'], () => axios.get(`/chat/singleChat/${auth.userId}/${location.state.user2}`), {
        onSuccess: (res) => {
            setId(res?.data?._id);
        },
        onError: (error) => {
            console.log(error);
        }
    });

    useEffect(() => {
        if (socket) {
            const handleRefetchChat = (data) => {
                if (data.chatId === id) {
                    chats.refetch()
                    messageRead2.mutate({ chatId: id, userId: auth.userId })
                }
            };

            socket.on('refetchChat', handleRefetchChat);

            return () => {
                // Cleanup function to remove the event listener
                socket.off('refetchChat', handleRefetchChat);
            };
        }
    }, [socket, id, chats.refetch]);

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [chats.data]);

    const messageRead2 = useMutation((data) => axios.post(`/chat/messageRead`, data), {
        onSuccess: (res) => {
            chats.refetch()
            client.invalidateQueries("allChats")
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const sendMessage = useMutation((data) => axios.post(`/chat/newMessage`, data), {
        onSuccess: (res) => {
            chats.refetch()
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleMessage = (e) => {
        e.preventDefault()
        setMessage("")
        const currentDate = new Date();
        // Get the year, month, and day from the current date
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        // Get the hours and minutes from the current time
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        let date = `${year}-${month}-${day}`;
        let time = `${hours}:${minutes}`;

        sendMessage.mutate({
            user1: auth.userId,
            user2: location.state.user2,
            senderId: auth.userId,
            text: message,
            type: 'text',
            date: date,
            time: time
        })
    }

    const handleUpload = async (e) => {
        let file = e.target.files[0]
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
                                const currentDate = new Date();
                                // Get the year, month, and day from the current date
                                const year = currentDate.getFullYear();
                                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                                const day = String(currentDate.getDate()).padStart(2, '0');
                                // Get the hours and minutes from the current time
                                const hours = String(currentDate.getHours()).padStart(2, '0');
                                const minutes = String(currentDate.getMinutes()).padStart(2, '0');
                                let date = `${year}-${month}-${day}`;
                                let time = `${hours}:${minutes}`;

                                sendMessage.mutate({
                                    user1: auth.userId,
                                    user2: location.state.user2,
                                    senderId: auth.userId,
                                    text: url,
                                    type: 'image',
                                    date: date,
                                    time: time
                                })
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

    return (
        <>
            <div className='flex text-[1.3rem] sm:text-[1rem] xsm:text-[1rem] items-center bg-[#cccccc21] h-[2.5em] '>
                <img src={chatbackarrow} className="w-[0.625em] h-[0.9375em] cursor-pointer ml-[0.625em] mr-[0.9375em]" onClick={() => navigate(-1)} alt="back button" />
                <img src={location.state.userImage !== null ? location.state.userImage : user} onClick={() => navigate(`/profile/public/${location.state.user2}`)} className="h-[1.5em] w-[1.5em] rounded-full cursor-pointer" alt="user" />
                <h1 onClick={() => navigate(`/profile/public/${location.state.user2}`)} className='text-[0.75em] cursor-pointer text-[#595959] font-[700] ml-[0.75em]'>{location.state.userName}</h1>
            </div>
            {!chats.isLoading ?
                <div className=' flex flex-col ' style={{ height: "calc(100vh - 121px)", scrollBehavior: "smooth" }}>
                    <div className='flex flex-col pb-[10px] flex-1 pt-[1.25em] px-[.6em] xsm:px-[0] sm:px-[0] gap-[0.9375em] overflow-y-auto' ref={containerRef}>
                        {chats?.data?.data?.messages?.map((value, index) => {
                            // Get the day from the message timestamp
                            const messageDay = moment(value.timestamp).format('dddd, MMMM DD');
                            // Check if the current message belongs to a new day
                            if (messageDay !== currentDay) {
                                // Update the current day variable
                                currentDay = messageDay;
                                // Render the day before the first message of that day
                                return (
                                    <React.Fragment key={index}>
                                        <div className='text-center text-[.8em] font-[600] mt-2'>
                                            {currentDay}
                                        </div>
                                        {auth.userId === value.sender ? (
                                            <div className='flex px-[0.8125em] justify-center ml-auto items-start' key={index}>
                                                <div className='flex flex-col gap-[5px]'>
                                                    <p className='text-[0.65em] text-end font-[300]'>{value.time}</p>
                                                    <div className='flex justify-center items-center py-[0.675em] px-[1em] rounded-[6px] border-[0.1px] bg-[#ffffff] border-[#ccc]'>
                                                        {value.type === 'text' && <p className='w-[100%] xsm:text-[0.75em] sm:text-[0.75em] text-[0.85em] font-[600]' >{value.content}</p>}
                                                        {value.type === 'image' && <img src={value.content} className='object-cover xsm:w-[40vw] sm:w-[40vw] w-[20vw]' alt="image" />}
                                                    </div>
                                                </div>
                                                {/* <img src={user} onClick={() => navigate('/profile/private')} className="ml-[0.5em] cursor-pointer h-[1.875em]" alt="user" /> */}
                                            </div>
                                        ) : (
                                            <div className='flex px-[0.8125em] justify-center mr-auto items-start' key={index}>
                                                <img src={location.state.userImage !== null ? location.state.userImage : user} onClick={() => navigate(`/profile/public/${location.state.user2}`)} className="mr-[0.5em] mt-[2px] h-[1.875em] w-[1.875em] cursor-pointer rounded-full" alt="user" />
                                                <div className='flex flex-col gap-[5px]'>
                                                    <p className='text-[0.65em] font-[300]'>{value.time}</p>
                                                    <div className='flex justify-center items-center py-[0.675em] px-[1em] rounded-[4px] bg-primary'>
                                                        {value.type === 'text' && <p className='w-[100%] text-[#ffffff] xsm:text-[0.75em] sm:text-[0.75em] text-[0.85em] font-[600]' >{value.content}</p>}
                                                        {value.type === 'image' && <img src={value.content} className='object-cover xsm:w-[40vw] sm:w-[40vw] w-[20vw]' alt="image" />}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            } else {
                                return (
                                    auth.userId === value.sender ? (
                                        <div className='flex px-[0.8125em] justify-center ml-auto items-start' key={index}>
                                            <div className='flex flex-col gap-[5px]'>
                                                <p className='text-[0.65em] text-end font-[300]'>{value.time}</p>
                                                <div className='flex justify-center items-center py-[0.675em]  px-[1em] rounded-[6px] border-[0.1px] bg-[#ffffff] border-[#ccc]'>
                                                    {value.type === 'text' && <p className='w-[100%] xsm:text-[0.75em] sm:text-[0.75em] text-[0.85em] font-[600]' >{value.content}</p>}
                                                    {value.type === 'image' && <img src={value.content} className='xsm:w-[40vw] sm:w-[40vw] w-[20vw]' alt="image" />}
                                                </div>
                                                {(value.read === true && index + 1 === chats?.data?.data?.messages?.length) && <div className='flex items-center justify-end'>
                                                    <img src={location.state.userImage !== null ? location.state.userImage : user} className="mr-[0.4em] w-[1em] h-[1em] cursor-pointer rounded-full" alt="user" />
                                                    <p className='text-[0.65em] font-[300]'>Read</p>
                                                </div>}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className='flex px-[0.8125em] justify-center mr-auto items-start' key={index}>
                                            <img src={location.state.userImage !== null ? location.state.userImage : user} onClick={() => navigate(`/profile/public/${location.state.user2}`)} className="mr-[0.5em] mt-[2px] h-[1.875em] w-[1.875em] cursor-pointer rounded-full" alt="user" />
                                            <div className='flex flex-col gap-[5px]'>
                                                <p className='text-[0.65em] font-[300]'>{value.time}</p>
                                                <div className='flex justify-center items-center py-[0.675em] px-[1em] rounded-[4px] bg-primary'>
                                                    {value.type === 'text' && <p className='w-[100%] xsm:text-[0.75em] text-[#ffffff] sm:text-[0.75em] text-[0.85em] font-[600]' >{value.content}</p>}
                                                    {value.type === 'image' && <img src={value.content} className='object-cover xsm:w-[40vw] sm:w-[40vw] w-[20vw]' alt="image" />}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )
                            }
                        })}
                    </div>
                    <form onSubmit={handleMessage} className='border-t-[0.5px] border-t-[#ccc] flex justify-between items-center pr-[1.875em] xsm:h-[3.75em] sm:h-[3.75em] h-[4.75em]'>
                        <input
                            id="fileInput"
                            type="file"
                            style={{ display: 'none' }}
                            onChange={(e) => handleUpload(e)}
                        />
                        <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Write a message' required className='border-[0.5px] px-[0.7125em] text-[0.75em] font-[500] flex-1 mx-4 xsm:h-[39px] sm:h-[39px] h-[49px] resize-none rounded-[8px]' />
                        {message === '' && <label htmlFor="fileInput" className="cursor-pointer">
                            <img src={imagesend} className='hey' alt="send an image" />
                        </label>}
                        {message !== '' && <button type='submit'><img src={send} className="cursor-pointer" alt="send message" /></button>}
                    </form>
                </div> : <><Loader /></>}
        </>

    )
}

export default SingleChat