import React, { useContext, useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import signin from './../assets/signin.svg';
import useAuth from '../hooks/useAuth';
import { Menu, MenuItem } from '@mui/material';
import { io } from 'socket.io-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axios';

const Navbar = () => {
    const location = useLocation();
    const [showShadow, setShowShadow] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const navigate = useNavigate()
    const { auth, setAuth, setSocket, socket } = useAuth();
    const [isSocketReady, setIsSocketReady] = useState(false);
    const queryClient = useQueryClient();
    let userInfoQuery
    let userMessageQuery

    if (auth.userId) {
        userInfoQuery = useQuery(['userNotification', auth.userId], () => axios.get(`/user/getNotification/${auth.userId}`), {
            onSuccess: () => {
            },
            onError: (error) => {
                console.log(error);
            }
        });
    }
    if (auth.userId) {
        userMessageQuery = useQuery(['userMessagess', auth.userId], () => axios.get(`/chat/getUserUnreadChats/${auth.userId}`), {
            onSuccess: (res) => {
            },
            onError: (error) => {
                console.log(error);
            }
        });
    }

    const setRead = useMutation((data) => axios.post(`/user/setReadNotifications`, data), {
        onSuccess: () => {
            queryClient.invalidateQueries('userNotification')
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = (e) => {
        setAnchorElUser(null);
        e.stopPropagation();
    };

    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const handleScroll = () => {
        if (window.pageYOffset > 0) {
            setShowShadow(true);
        } else if (window.pageYOffset === 0) {
            setShowShadow(false);
        }
    };

    useEffect(() => {
        const socket = io('https://fleadisc.herokuapp.com');

        // Emit 'newUser' event when auth.userId changes
        if (auth.userId) {
            socket.emit('newUser', auth.userId);
            setSocket(socket);
        }

        // Set isSocketReady to true once socket is ready
        socket.on('connect', () => {
            setIsSocketReady(true);
        });

        return () => {
            // Emit 'removeUser' event and close socket when component unmounts
            if (auth.userId) {
                socket.emit('removeUser', socket.id);
            }
            socket.close();
        };
    }, [auth.userId]);

    useEffect(() => {
        if (isSocketReady && socket) { // Check if socket is ready before using it
            socket.on('refetchNotification', () => {
                if (location.pathname === '/delivery' || location.pathname === '/delivery/selling') {
                    setRead.mutate({ userId: auth.userId })
                }
                else {
                    queryClient.invalidateQueries('userNotification')
                }
            })
            socket.on('refetchMessageRead', () => {
                console.log('i hhhhhhhhhhhh');
                queryClient.invalidateQueries('userMessagess')
            })
        }
    }, [isSocketReady, socket]);


    const handleLogout = (e) => {
        handleCloseUserMenu(e);
        setAuth({})
        socket?.emit("newUser", auth.userId)
        navigate('/signin')
    }

    return (
        <>
            <div style={showShadow ? { boxShadow: "0px 2px 12px rgba(0,0,0,0.1)" } : {}} className='flex items-center fixed w-full h-[67px] justify-center bg-[#FAFAFA] z-20'>
                <div className='h-[67px] w-full text-[1.2rem] sm:text-[0.75rem] xsm:text-[0.75rem] font-sans font-[400] xsm:max-w-[100vw] sm:max-w-[100vw] max-w-[70vw] m-auto flex items-center justify-around gap-[1.256em] px-[1.125em]'>
                    <NavLink to="/" className="nav-link flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000]" activeclassname="active">
                        <svg width="19" height="19"><path d="M0.125 0.125V8.45833H8.45833V0.125H0.125ZM6.375 6.375H2.20833V2.20833H6.375V6.375ZM0.125 10.5417V18.875H8.45833V10.5417H0.125ZM6.375 16.7917H2.20833V12.625H6.375V16.7917ZM10.5417 0.125V8.45833H18.875V0.125H10.5417ZM16.7917 6.375H12.625V2.20833H16.7917V6.375ZM10.5417 10.5417V18.875H18.875V10.5417H10.5417ZM16.7917 16.7917H12.625V12.625H16.7917V16.7917Z" /></svg>
                        <h1 className='text-[.75em]'>Listings</h1>
                    </NavLink>
                    <NavLink onClick={() => { if (auth.userId) { setRead.mutate({ userId: auth.userId }) } }} to="/delivery" className="nav-link flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000]" activeclassname="active">
                        <div className='mt-[-3px] relative'>
                            <svg width="25" height="25" >
                                <path d="M8.7625 16.0714H0V19.6429H8.7625V25L13.75 17.8571L8.7625 10.7143V16.0714ZM16.2375 14.2857V8.92857H25V5.35714H16.2375V0L11.25 7.14286L16.2375 14.2857Z" />
                            </svg>
                            {userInfoQuery?.data?.data?.length > 0 && <span className='absolute bg-[#f71c1cd2] right-[-20px] text-[#ffff] flex justify-center items-center rounded-full top-0 w-[18px] h-[18px] text-[9px]'>{userInfoQuery?.data?.data?.length}</span>}
                        </div>
                        <h1 className='text-[.75em] mt-[-3px]'>Delivery</h1>
                    </NavLink>
                    <NavLink to="/create" className="nav-link flex flex-col gap-[3px] mt-[1px] min-w-[50px] items-center text-[#00000]" activeclassname="active">
                        <svg width="19" height="19" viewBox="0 0 19 19" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.7917 0.125H2.20833C1.05208 0.125 0.125 1.0625 0.125 2.20833V16.7917C0.125 17.9375 1.05208 18.875 2.20833 18.875H16.7917C17.9375 18.875 18.875 17.9375 18.875 16.7917V2.20833C18.875 1.0625 17.9375 0.125 16.7917 0.125ZM14.7083 10.5417H10.5417V14.7083H8.45833V10.5417H4.29167V8.45833H8.45833V4.29167H10.5417V8.45833H14.7083V10.5417Z" />
                        </svg>
                        <h1 className='text-[.75em] leading-[14.63px]'>Create</h1>
                    </NavLink>
                    <NavLink to="/messages" className="nav-link flex flex-col gap-[3px] min-w-[60px] items-center text-[#00000]" activeclassname="active">
                        <div className='mt-[-2px] relative'>
                            <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 0H2C0.9 0 0 0.9 0 2V20L4 16H18C19.1 16 20 15.1 20 14V2C20 0.9 19.1 0 18 0ZM18 14H3.2L2 15.2V2H18V14Z" />
                            </svg>
                            {auth?.userId && (!userMessageQuery?.isLoading && userMessageQuery?.data?.data?.unReadMessages !== 0) && <span className='absolute bg-[#f71c1cd2] right-[-20px] text-[#ffff] flex justify-center items-center rounded-full top-0 w-[18px] h-[18px] text-[9px]'>{userMessageQuery?.data?.data?.unReadMessages}</span>}
                        </div>
                        <h1 className='text-[.75em]'>Messages</h1>
                    </NavLink>
                    {Object.keys(auth).length === 0 ? <NavLink to="/signin" className="flex flex-col gap-[3px] min-w-[50px] items-center">
                        <img src={signin} className="h-[22px] w-[22px]" alt='delivery' />
                        <h1 className='text-[.75em] mt-[-2px]'>Sign In</h1>
                    </NavLink> :
                        <div onClick={handleOpenUserMenu} className='cursor-pointer flex flex-col gap-[3px] min-w-[50px] items-center'>
                            <img src={auth.profilePicture === null ? signin : auth.profilePicture} className={`h-[23px] w-[23px] rounded-full cursor-pointer`} alt='profile' />
                            <Menu sx={{ mt: '45px' }} id="menu-appbar" anchorEl={anchorElUser} anchorOrigin={{ vertical: 'top', horizontal: 'right', }} keepMounted transformOrigin={{ vertical: 'top', horizontal: 'right', }} open={Boolean(anchorElUser)} onClose={handleCloseUserMenu}>
                                <MenuItem onClick={(e) => { handleCloseUserMenu(e); navigate('/profile/private') }}>
                                    <h1 className=" flex flex-col font-sans text-[.8em] gap-[3px] min-w-[80px] items-center" activeclassname="active">
                                        Profile
                                    </h1>
                                </MenuItem>
                                <MenuItem onClick={(e) => handleLogout(e)}>
                                    <h1 className='min-w-[80px] text-center font-sans text-[.8em]' >Logout</h1>
                                </MenuItem>
                            </Menu>
                            <h1 className={` ${(location.pathname === "/profile/private" || location.pathname === '/profile/private/listings' || location.pathname === '/profile/private/purchases') ? "text-primary font-[600] text-[.75em] mt-[-2px]" : 'text-[.75em] mt-[-2px] font-[400]'}`}>Profile</h1>
                        </div>
                    }
                </div>
            </div>
            <div className='pt-[67px]'>
                <Outlet />
            </div>
        </>
    )
}

export default Navbar

