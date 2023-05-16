import React, { useState } from 'react'

const Faq = ({ title, description }) => {
    const [showDescription, setShowDescription] = useState(false);

    const handleClick = () => {
        setShowDescription(!showDescription);
    };

    return (
        <div>
            <div onClick={handleClick} className='bg-[#81B29A] cursor-pointer rounded-[8px] h-[36px] flex items-center pl-[16px]'>
                <h2 className=' text-[12px] font-[600] text-[#ffffff]'>{title}</h2>
            </div>
            {showDescription && <p className='text-[12px] px-[5px] py-[5px] font-[500]'>{description}</p>}
        </div>
    )
}

export default Faq