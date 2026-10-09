"use client"

import { useState, useCallback } from "react"
import Cropper from "react-easy-crop"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface PhotoCropModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    imageSrc: string
    onCropComplete: (croppedBase64: string) => void
}

export function PhotoCropModal({ open, onOpenChange, imageSrc, onCropComplete }: PhotoCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)

    const onCropCompleteHandler = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error("No 2d context")

        canvas.width = 256
        canvas.height = 256

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            256,
            256
        )

        return canvas.toDataURL('image/jpeg', 0.8)
    }

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
            onCropComplete(croppedImage)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Crop Photo</DialogTitle>
                    <DialogDescription>
                        Adjust the image to fit the circular profile format.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-64 bg-slate-900 rounded-md overflow-hidden my-4">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        cropShape="round"
                        showGrid={false}
                        onCropChange={setCrop}
                        onCropComplete={onCropCompleteHandler}
                        onZoomChange={setZoom}
                    />
                </div>
                <div className="flex items-center gap-2 px-2">
                    <span className="text-sm">Zoom</span>
                    <Slider
                        value={[zoom]}
                        min={1}
                        max={3}
                        step={0.1}
                        onValueChange={(vals) => setZoom(vals[0])}
                    />
                </div>
                <DialogFooter className="mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Apply Crop</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
