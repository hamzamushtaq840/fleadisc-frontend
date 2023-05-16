import React from 'react'
import { ColorRing } from 'react-loader-spinner'

const Loader = () => {
    return (
        <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }} className=''>
            <ColorRing
                visible={true}
                height="80"
                width="80"
                ariaLabel="blocks-loading"
                wrapperStyle={{}}
                wrapperClass="blocks-wrapper"
                colors={['#494949', '#494949', '#494949', '#494949', '#494949']}
            />
        </div>
    )
}

export default Loader