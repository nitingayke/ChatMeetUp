import moment from 'moment';

export function formatTime(currTime){
    const time = moment(currTime);

    if (time.isSame(moment(), 'day')) {
        return time.fromNow();
    } else if (time.isSame(moment().subtract(1, 'day'), 'day')) {
        return 'Yesterday';
    } else {
        return time.format("DD-MM-YYYY");
    }
}

const getRandomNo = () => Math.floor(Math.random() * 255);

export function getRandomColor(){
    return `rgb(${getRandomNo()}, ${getRandomNo()}, ${getRandomNo()})`;
}
