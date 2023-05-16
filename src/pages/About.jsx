import React from 'react'
import Faq from './../components/about/Faq'

const About = () => {

    const faq = [
        {
            title: 'Are offers binding',
            description: ' Lorem ipsum dolor sit amet consectetur, adipisicing elit. A cupiditate debitis voluptatibus quidem blanditiis sunt suscipit explicabo nostrum in hic?'
        },
        {
            title: 'Are offers binding',
            description: ' Lorem ipsum dolor sit amet consectetur, adipisicing elit. A cupiditate debitis voluptatibus quidem blanditiis sunt suscipit explicabo nostrum in hic?'
        }
    ]

    return (
        <div className='flex justify-center'>
            <div style={{ height: "calc(100vh - 78px)", scrollBehavior: "smooth" }} className='px-[1.25em] xsm:w-full sm:w-full w-[90%] xsm:pt-[0px] pt-[30px] sm:pt-[0px] sm:text-[1rem] xsm:text-[1rem] text-[1.2rem]'>
                <div className='flex flex-col pt-[10px] gap-[0.4875em]'>
                    <h1 className='text-[1.25em] font-[700]'>About Fleadisc</h1>
                    <p className='text-[0.75em] w-[80%] font-[500]'>Fleadisc is an independent platform for buying and selling discs between private individuals. You can see us as a variant of a buy and sell group on Facebook</p>
                </div>
                <div className='mt-[1.25em]'>
                    <h1 className='text-[1.25em] mb-[0.9375em] font-[700]'>FAQ</h1>
                    <div className='flex flex-col gap-[0.625em]' >
                        {faq.map((item, index) => {
                            return (
                                <Faq title={item.title} description={item.description} />
                            )
                        })}
                    </div>
                </div>
                <div className='mt-[1.5625em]'>
                    <h1 className='text-[1.25em] mb-[0.9375em] font-[700]'>Contact</h1>

                </div>
            </div>
        </div>

    )
}

export default About