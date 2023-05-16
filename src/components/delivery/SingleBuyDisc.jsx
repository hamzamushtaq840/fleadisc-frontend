import React, { useMemo, useState } from 'react'
import moment from 'moment'
import OlderBids from '../listings/OlderBids';
import CancelBuyer from './CancelBuyer';

const SingleBuyDisc = ({ value, temp }) => {
    const [model, setModel] = useState(false)
    const [oldModal, setOldModal] = useState(false)
    const oldModalComponent = useMemo(() => <OlderBids setModel={setOldModal} discId={value.discId._id} />, [setOldModal]);
    const userCurrency = "SEK";

    function getMonthAndDate(dateString) {
        const date = moment(dateString);
        const monthName = date.format("MMM");
        const dayOfMonth = date.format("D");
        return `${dayOfMonth} ${monthName}`;
    }

    function remainingTime(endDay, endTime) {
        const endDateTime = moment(`${endDay} ${endTime}`);
        const start = moment();
        const diff = start.diff(endDateTime);
        const duration = moment.duration(diff);
        const years = duration.years();
        const months = duration.months();
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        let passedTime;
        if (years > 0) {
            passedTime = `${years} ${years === 1 ? 'y' : 'y'}`;
        } else if (months > 0) {
            passedTime = `${months} ${months === 1 ? 'm' : 'm'}`;
        } else if (days > 0) {
            passedTime = `${days} ${days === 1 ? 'd' : 'd'} ${hours}h`;
        } else if (hours > 0) {
            passedTime = `${hours}h ${minutes}${minutes === 1 ? 'm' : 'm'}`;
        } else if (minutes > 0) {
            passedTime = `${minutes}${minutes === 1 ? 'm' : 'm'}`;
            if (seconds > 0) {
                passedTime += ` ${seconds}s`;
            }
        } else {
            passedTime = `${seconds} s`;
        }

        return passedTime;
    }

    const handleCancel = () => {
        setModel(true)
    }

    return (
        <>
            <div className='flex flex-col items-center gap-[10px]'>
                <div className={`flex flex-col card  mb-[10px] pb-[8px] card rounded-[8px] bg-[#ffffff] xsm:text-[1.07rem] sm:text-[1.07rem] text-[1.2rem] flex-wrap xsm:min-w-[165px] xsm:max-w-[165px] sm:min-w-[165px] sm:max-w-[165px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px]`} >
                    <img src={value.discId.pictureURL} className=' hover:opacity-[0.8] xsm:h-[165px] rounded-t-[8px] sm:h-[165px] md:h-[200px] lg:h-[210px] xsm:min-w-[165px] xsm:max-w-[165px] sm:min-w-[165px] sm:max-w-[165px] md:min-w-[200px] md:max-w-[200px] lg:min-w-[210px] lg:max-w-[210px] xl:min-w-[220px] xl:h-[220px] xl:max-w-[220px] 2xl:min-w-[240px] 2xl:max-w-[240px] 2xl:h-[240px] cursor-pointer' alt="" />
                    <div className='flex flex-col  justify-between px-[0.625em] pt-[0.425em]'>
                        <div className='flex  justify-between'>
                            <div className='flex flex-col'>
                                <div className='flex items-start'>
                                    <div className='flex flex-col mr-[0.425em]'>
                                        <h1 className='text-[0.75em] font-[700]' >{value.discId.discName}</h1>
                                        <h1 className='text-[0.55em] font-[500] mt-[-0.413em] min-w-[55px] text-[##595959]' >{value.discId.brand}</h1>
                                    </div>
                                    <span className='px-[0.5em] mt-[2px] text-[0.563em] border-[1px] rounded-full border-[#595959]'>{value.discId.condition}</span>
                                </div>
                                <div className='flex flex-col '>
                                    <div className='flex mt-[5px] flex-col  text-[#595959]'>
                                        <span className='font-[600] text-[0.6em]'>{getMonthAndDate(value.discId.endDay)} - {value.discId.endTime} </span>
                                        <span className='font-[500] text-[#595959BF] text-[0.55em]'>Bought {remainingTime(value.discId.endDay, value.discId.endTime)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className='flex flex-col h-full justify-end items-end'>
                                <div className='flex flex-col items-end'>
                                    {value.discId.priceType === 'fixedPrice' && <span className='text-[0.65em] mb-[-3px] text-end flex items-end  font-[600]'>{value.discId.startingPrice} {userCurrency}</span>}
                                    {value.discId.priceType === 'auction' && <span className='text-[0.65em] mb-[-3px] text-end flex items-end  font-[600]'>{value?.discId?.buyer?.buyPrice} {userCurrency}</span>}
                                    {value.discId.priceType === 'fixedPrice' && <span className='text-[0.6em] min-w-[57px] text-end font-[500] text-[#595959bf]'>Fixed price</span>}
                                    {(value.discId.priceType !== 'fixedPrice') &&
                                        <div className='flex items-center  text-[1em]'>
                                            <p onClick={(e) => {
                                                if (value.discId.bids.length === 0)
                                                    return
                                                setOldModal(true); e.stopPropagation();
                                            }} className='text-[0.6em] cursor-pointer hover:underline hover:text-text font-[500] text-[#595959BF] '>{value.discId.bids.length} Bids</p>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <button style={{ boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)" }} className='bg-[#F21111] font-[600] text-[0.75em] text-[white] rounded-[4px] py-[0.45em] px-[1em] ' onClick={handleCancel}>Cancel Purchase</button>
            </div>
            {oldModal && oldModalComponent}
            {model && <CancelBuyer temp={temp} setModel={setModel} disc={value.discId} />}
        </>
    )
}

export default SingleBuyDisc