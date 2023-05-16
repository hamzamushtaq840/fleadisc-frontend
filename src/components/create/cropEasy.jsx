import { Cancel } from '@mui/icons-material';
import CropIcon from '@mui/icons-material/Crop';
import {
    Box,
    Button,
    DialogActions,
    DialogContent,
    Slider,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import { styled } from '@mui/material/styles';

const CropEasy = ({ photoURL, setOpenCrop, onFinish, dontCrop }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const cropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const ColorButton = styled(Button)(({ theme }) => ({
        backgroundColor: '#F21111',
        fontSize: '.7em',
        cursor: "pointer",
        color: "#ffffff",
        borderRadius: '4px',
        borderColor: '#F21111',
        letterSpacing: "1px",
        transition: "transform 80ms ease-in",
        '&:hover': {
            backgroundColor: '#F21111',
            borderColor: '#F21111',
        },
    }));

    const ColorButton2 = styled(Button)(({ theme }) => ({
        backgroundColor: '#81B29A',
        fontSize: '.7em',
        cursor: "pointer",
        color: "#ffffff",
        borderRadius: '4px',
        borderColor: '#81B29A',
        letterSpacing: "1px",
        transition: "transform 80ms ease-in",
        '&:hover': {
            backgroundColor: '#81B29A',
            borderColor: '#81B29A',
        },
    }));

    const Slider2 = styled(Slider)(({ theme }) => ({
        color: "#81B29A",
    }));

    const cropImage = async () => {
        try {
            const { file, url } = await getCroppedImg(
                photoURL,
                croppedAreaPixels,
                rotation
            );
            setOpenCrop(false);
            onFinish(file, url)
        } catch (error) {
            console.log(error);
        }

    };
    return (
        <>
            <div className='modalBackground' onClick={() => { setPhotoURL(null); setFile(null); setOpenCrop(false) }}></div>
            <div className='modalContainer xsm:text-[16px] sm:text-[16px] text-[20px] sm:h-[35%] sm:w-[90%] xsm:w-[90%]  w-[40%] flex flex-col justify-center items-center'>
                <DialogContent
                    dividers
                    className='w-[90%]'
                    sx={{
                        background: '#333',
                        position: 'relative',
                        height: 400,
                        marginTop: '20px'
                    }}
                >
                    <Cropper
                        image={photoURL}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={16 / 16}
                        showGrid={true}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropChange={setCrop}
                        onCropComplete={cropComplete}
                    />
                </DialogContent>
                <DialogActions sx={{ flexDirection: 'column', mx: 3, my: 2 }}>
                    <Box sx={{ width: '100%', mb: 1 }}>
                        <Box>
                            <Typography>Zoom: {zoomPercent(zoom)}</Typography>
                            <Slider2
                                valueLabelDisplay="auto"
                                valueLabelFormat={zoomPercent}
                                min={1}
                                max={3}
                                step={0.1}
                                value={zoom}
                                onChange={(e, zoom) => setZoom(zoom)}
                            />
                        </Box>
                        <Box>
                            <Typography>Rotation: {rotation + '°'}</Typography>
                            <Slider2
                                valueLabelDisplay="auto"
                                min={0}
                                max={360}
                                value={rotation}
                                onChange={(e, rotation) => setRotation(rotation)}
                            />
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            flexWrap: 'wrap',
                        }}
                    >
                        <ColorButton
                            className='buttonAnimation'
                            variant="outlined"
                            startIcon={<Cancel />}
                            onClick={() => { dontCrop(photoURL); setOpenCrop(false) }}
                        >
                            Dont Crop
                        </ColorButton>
                        <ColorButton2
                            className='buttonAnimation'
                            variant="contained"
                            startIcon={<CropIcon />}
                            onClick={cropImage}
                        >
                            Crop
                        </ColorButton2>
                    </Box>
                </DialogActions>

            </div>
        </>
    );
};

export default CropEasy;

const zoomPercent = (value) => {
    return `${Math.round(value * 100)}%`;
};