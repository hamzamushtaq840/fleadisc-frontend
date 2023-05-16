import React, { useEffect } from 'react'
import message from './../assets/message.svg'
import { useQuery } from '@tanstack/react-query'
import useAuth from '../hooks/useAuth'
import axios from '../api/axios'
import Chats from '../components/messages/Chats'
import Loader from '../components/Loader'
import moment from 'moment'

const Messages = () => {
    const { auth, socket } = useAuth()

    const chats = useQuery(['allChats', auth.userId], () => axios.get(`/chat/${auth.userId}`), {
        onSuccess: (res) => {
        },
        onError: (error) => {
            console.log(error);
        }
    });

    useEffect(() => {
        if (socket) {
            socket.on('refetchChat', () => {
                chats.refetch()
            })
        }
    }, [])

    chats?.data?.data.sort((a, b) => {
        const aTimestamp = moment(`${a.messages[0].date} ${a.messages[0].time}`, 'YYYY-MM-DD HH:mm:ss').valueOf();
        const bTimestamp = moment(`${b.messages[0].date} ${b.messages[0].time}`, 'YYYY-MM-DD HH:mm:ss').valueOf();
        return bTimestamp - aTimestamp;
    });

    if (chats.isLoading && !chats.data) {
        return (
            <Loader />
        )
    }
    else
        return (
            <div className='flex justify-center '>
                <div className='px-[1.25em] xsm:w-full sm:w-full w-[98%] sm:text-[1rem] xsm:text-[1rem] text-[1.2rem] min-h-[90vh]'>
                    <h1 className='xsm:mt-[0.438em] sm:mt-[0.438em] mt-[1.5em] text-[1.25em] font-[700] xsm:mb-[0.875em] sm:mb-[0.875em] mb-[1.4em]'>Messages</h1>
                    <div className='flex flex-col gap-[0.825em]'>
                        {chats?.data?.data.length === 0 ? (
                            <div className='flex min-h-[50vh] justify-center items-center flex-col gap-[0.825rem]'>
                                <img src={message} className='h-[1.9em] w-[1.9em] opacity-[0.3]' alt="" />
                                <p className='flex text-[.9em] font-[400] justify-center items-center text-[#00000080]'>You don't have any conversations</p>
                            </div>
                        ) : (
                            chats?.data?.data.map((value, index) => (
                                <Chats key={index} value={value} index={index} chats={chats} />
                            ))
                        )}
                    </div>
                </div>
            </div>
        )
}

export default Messages