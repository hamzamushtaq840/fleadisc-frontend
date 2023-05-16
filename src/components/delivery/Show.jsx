import React, { useState } from 'react'
import CancelBuyer from './CancelBuyer'
import CancelSellerConfirm from './CancelSellerConfirm'

const Show = ({ val }) => {
    const [model, setModel] = useState(true)
    return (
        <>{model && <CancelSellerConfirm setModel={setModel} val={val} />}</>
    )
}

export default Show