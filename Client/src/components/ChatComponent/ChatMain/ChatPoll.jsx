import React, { useContext } from 'react';
import UserContext from '../../../context/UserContext';
import LoaderContext from '../../../context/LoaderContext';
import { useSnackbar } from 'notistack';
import { socket } from '../../../services/socketService';
import ChatContext from '../../../context/ChatContext';

export default function ChatPoll({ data, localChat }) {

    const { loginUser } = useContext(UserContext);
    const { joinedUsers } = useContext(ChatContext);
    const { setIsMessageProcessing } = useContext(LoaderContext);
    const { enqueueSnackbar } = useSnackbar();

    const handlePollOptions = (pollIdx) => {

        if (!loginUser) {
            enqueueSnackbar("User not found. Please log in to continue.");
            return;
        }

        if (!data || pollIdx === undefined) {
            enqueueSnackbar("Chat data not found, please try again.", { variant: 'error' });
            return;
        }

        const userAlreadyVoted = data?.poll?.some((option) => option.votes.includes(loginUser?._id));

        if (userAlreadyVoted) {
            enqueueSnackbar("User has already voted in this poll.", { variant: "warning" });
            return;
        }

        setIsMessageProcessing(true);
        socket.emit('userchat-poll-vote', {
            conversationId: localChat?._id,
            userId: loginUser?._id,
            username: loginUser?.username,
            chatId: data._id,
            pollIdx,
            joinedUsers
        });
    }

    if (!data?.poll || data?.poll?.length === 0) return null;

    return (
        <div className='mt-2 space-y-2'>
            {data.poll.map((pollOption, idx) => {

                const totalMembers = localChat?.members?.length ?? 2;
                const voteCount = pollOption?.votes?.length ?? 0;
                const votePercentage = totalMembers > 0 ? Math.min((voteCount / totalMembers) * 100, 100) : 0;

                const hasUserVoted = data.poll.some(option =>
                    option.votes?.some(vote => vote.userId === loginUser?._id)
                );

                return (
                    <button
                        key={pollOption?.option ?? `poll-option-${idx}`}
                        onClick={() => handlePollOptions(idx)}
                        className='px-1 py-2 text-base/3 w-full flex flex-col cursor-pointer rounded hover:bg-[#ffffff15]'>
                        <p className='text-sm flex break-all'>
                            {pollOption?.option ?? 'Option'}
                            <span className='ps-2 text-nowrap'>{votePercentage.toFixed(1)}%</span>
                        </p>
                        <div className='rounded h-2 bg-gray-900 w-full mt-1'>
                            <p className="rounded bg-green-500 h-full"
                                style={{ width: !hasUserVoted ? `${votePercentage}%` : '0%' }}>
                            </p>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}