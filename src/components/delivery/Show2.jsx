import React, { useState } from 'react'
import CancelBuyerConfirm from './CancelBuyerConfirm'

const Show2 = ({ val }) => {
    const [model, setModel] = useState(true)

    return (
        <>{model && <CancelBuyerConfirm setModel={setModel} val={val} />}</>
    )
}

export default Show2