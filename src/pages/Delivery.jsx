import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

const Delivery = () => {
    return (
        <div className='flex flex-col xsm:text-[1rem] sm:text-[1rem] text-[1.2rem]' style={{ height: "calc(100vh - 67px)", scrollBehavior: "smooth" }}>
            <div className='flex items-center xsm:mt-[10px] sm:mt-[10px] xsm:mb-[0] sm:mb-[0] my-[20px] gap-[15px] justify-center'>
                <NavLink to="/delivery" className={({ isActive }) => { return isActive && location.pathname === "/delivery" ? "active px-[1.5rem] py-[0.5rem] nav-link2 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000]" : "px-[1.5rem] py-[0.5rem] nav-link2 flex flex-col gap-[3px] min-w-[50px] items-center text-[#00000]" }}>
                    <h2 className='text-[#0000005f] w-[4rem] text-center text-[0.875em] font-[500]'>Buying</h2>
                </NavLink>
                |
                <NavLink to="/delivery/selling" className={({ isActive }) => { return isActive && location.pathname === "/delivery/selling" ? "active nav-link2 flex flex-col px-[1.5rem] py-[0.5rem] gap-[3px] min-w-[50px] items-center text-[#00000]" : "nav-link2 flex flex-col px-[1.5rem] py-[0.5rem] gap-[3px] min-w-[50px] items-center text-[#00000]" }}>
                    <h2 className='text-[#0000005f] w-[4rem] text-center text-[0.875em] font-[500]'>Selling</h2>
                </NavLink>
            </div>
            <Outlet />
        </div>
    )
}

export default Delivery