import React from 'react'
import { useNavigate } from 'react-router-dom'
import user from './../../assets/signin.svg'
import useAuth from '../../hooks/useAuth'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../../api/axios'

const Chats = ({ value, index, chats }) => {
    const navigate = useNavigate()
    const client = useQueryClient()
    const { auth } = useAuth()
    const messageRead = useMutation((data) => axios.post(`/chat/messageRead`, data), {
        onSuccess: (res) => {
            client.invalidateQueries("allChats")
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleSingleChat = (id) => {
        messageRead.mutate({ chatId: id, userId: auth.userId })
        client.invalidateQueries('userMessagess')
        navigate("/messages/chat", {
            state: {
                chatId: id, user2: value.role === 'sender' ? value.receiver._id : value.sender._id, from: 'messages', userName: value.role === 'receiver' ? value.sender.name : value.receiver.name, userImage: value.role === 'sender'
                    ? (value.receiver.profilePicture !== null ? value.receiver.profilePicture : user)
                    : (value.sender.profilePicture !== null ? value.sender.profilePicture : user)
            }
        })
    }

    return (
        <div className='flex cursor-pointer' onClick={() => handleSingleChat(value._id)}>
            <div className='mr-[0.9375em]'>
                <img src={
                    value.role === 'sender'
                        ? (value.receiver.profilePicture !== null ? value.receiver.profilePicture : user)
                        : (value.sender.profilePicture !== null ? value.sender.profilePicture : user)}
                    className='h-[3.125em] rounded-full w-[3.125em]' alt="userImage" />
            </div>
            <div className='flex flex-col flex-1'>
                <h1 className='text-[.7em] text-[#595959] font-[700] mb-[0.125em]'>
                    {value.role === 'sender' ? value.receiver.name : value.sender.name}
                </h1>
                <p className={`text-[.7em] text-[#000000] mb-[0.625em] ${(value.messages[0].read === false && value.messages[0].sender !== auth.userId) ? "font-[700]" : "font-[400]"} `}>{value.messages[0].sender === auth.userId ? "Me: " : ""}{value.messages[0].type === 'text' ? value.messages[0].content : 'Image'}</p>
                <p className='text-[.5em] font-[500] text-[#595959bf] mb-[0.3125em]'>{value.messages[0].time} {value.messages[0].date}</p>
                {index + 1 !== chats.length && <div className='py-[0.019em] bg-[#5959593b]'></div>}
            </div>
        </div>
    )
}

export default Chats