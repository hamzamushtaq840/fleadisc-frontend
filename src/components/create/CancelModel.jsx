import { useMutation } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'react-toastify';
import axios from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const CancelModel = ({ setModel, discId }) => {
  const navigate = useNavigate()

  const deleteDisc = useMutation(() => axios.post(`/disc/cancel/${discId}`), {
    onSuccess: () => {
      toast.success('Listing cancelled successfully');
      navigate('/profile/private/listings')
      setModel(false);
    },
    onError: (error) => {
      console.log(error);
    }
  });

  const handleRemove = () => {
    deleteDisc.mutate()
  }

  return (
    <>
      <div className='modalBackground' onClick={() => setModel(false)}></div>
      <div className='modalContainer flex flex-col gap-[10px] xsm:text-[1rem] sm:text-[1rem] text-[1.2rem] sm:w-[70%] md:xsm-[405px] xsm:w-[80%] py-[40px] w-[40%] justify-center items-center'>
        <p className='w-[80%] text-center text-[.85em] font-[400] mt-[0.688em]'>Are you sure you want to cancel this active listing?<span className='font-[800]'></span></p>
        <div className='flex flex-wrap justify-center mb-[15px] gap-[11px] mt-[.5em]'>
          <button onClick={handleRemove} className='buttonAnimation relative py-[0.625em] button rounded-[4px] text-[.75em] px-[2.813em] text-[#ffffff] bg-primary'>
            {deleteDisc.isLoading ?
              <FaSpinner
                className="animate-spin absolute inset-0 m-auto"
                style={{ width: "1em", height: "1em", fontSize: '0.75em' }}
              />
              : "Confirm"}
          </button>
          <button onClick={() => setModel(false)} className='buttonAnimation py-[0.625em] button rounded-[4px] text-[.75em] px-[2.813em] text-[#ffffff] bg-[#F21111]'>Cancel</button>
        </div>
      </div>
    </>
  )
}


export default CancelModel