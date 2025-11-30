'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';
import socketService from '@/lib/socket';

interface VideoCallProps {
    chatId: string;
    callerId: string;
    isInitiator: boolean;
    onCallEnd: () => void;
}

export function VideoCall({ chatId, callerId, isInitiator, onCallEnd }: VideoCallProps) {
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting');

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        initializeCall();
        setupSocketListeners();

        return () => {
            endCall();
        };
    }, []);

    const initializeCall = async () => {
        try {
            // Get user media
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });

            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }

            // Create peer connection
            const configuration = {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ],
            };

            peerConnectionRef.current = new RTCPeerConnection(configuration);

            // Add local stream tracks
            stream.getTracks().forEach((track) => {
                peerConnectionRef.current?.addTrack(track, stream);
            });

            // Handle remote stream
            peerConnectionRef.current.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                    setCallStatus('connected');
                }
            };

            // Handle ICE candidates
            peerConnectionRef.current.onicecandidate = (event) => {
                if (event.candidate) {
                    socketService.emit('video_call_ice_candidate', {
                        chatId,
                        candidate: event.candidate,
                    });
                }
            };

            // If initiator, create offer
            if (isInitiator) {
                const offer = await peerConnectionRef.current.createOffer();
                await peerConnectionRef.current.setLocalDescription(offer);

                socketService.emit('video_call_offer', {
                    chatId,
                    offer,
                });
            }
        } catch (error) {
            console.error('Error initializing call:', error);
            alert('Failed to access camera/microphone');
            onCallEnd();
        }
    };

    const setupSocketListeners = () => {
        socketService.on('video_call_offer', async (data: { offer: RTCSessionDescriptionInit }) => {
            try {
                await peerConnectionRef.current?.setRemoteDescription(data.offer);
                const answer = await peerConnectionRef.current?.createAnswer();
                await peerConnectionRef.current?.setLocalDescription(answer!);

                socketService.emit('video_call_answer', {
                    chatId,
                    answer,
                });
            } catch (error) {
                console.error('Error handling offer:', error);
            }
        });

        socketService.on('video_call_answer', async (data: { answer: RTCSessionDescriptionInit }) => {
            try {
                await peerConnectionRef.current?.setRemoteDescription(data.answer);
            } catch (error) {
                console.error('Error handling answer:', error);
            }
        });

        socketService.on('video_call_ice_candidate', async (data: { candidate: RTCIceCandidateInit }) => {
            try {
                await peerConnectionRef.current?.addIceCandidate(data.candidate);
            } catch (error) {
                console.error('Error adding ICE candidate:', error);
            }
        });

        socketService.on('video_call_ended', () => {
            endCall();
        });
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach((track) => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const endCall = () => {
        // Stop all tracks
        localStreamRef.current?.getTracks().forEach((track) => track.stop());

        // Close peer connection
        peerConnectionRef.current?.close();

        // Notify other user
        socketService.emit('video_call_end', { chatId });

        // Clean up
        setCallStatus('ended');
        onCallEnd();
    };

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
            {/* Remote Video (Large) */}
            <div className="flex-1 relative bg-gray-900">
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {callStatus === 'connecting' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="text-2xl mb-4">📞</div>
                            <p className="text-xl">Connecting...</p>
                        </div>
                    </div>
                )}

                {/* Local Video (Small) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover mirror"
                    />
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-6 flex justify-center items-center gap-4">
                <Button
                    variant={isMuted ? 'destructive' : 'secondary'}
                    size="icon"
                    className="rounded-full w-14 h-14"
                    onClick={toggleMute}
                >
                    {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full w-16 h-16"
                    onClick={endCall}
                >
                    <PhoneOff className="h-8 w-8" />
                </Button>

                <Button
                    variant={isVideoOff ? 'destructive' : 'secondary'}
                    size="icon"
                    className="rounded-full w-14 h-14"
                    onClick={toggleVideo}
                >
                    {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                </Button>
            </div>

            <style jsx>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
}
