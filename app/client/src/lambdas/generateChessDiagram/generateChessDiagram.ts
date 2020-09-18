import Canvas from 'canvas';
//@ts-ignore
const Frame = require('canvas-to-buffer');
import { Square } from 'chess.js';
const Chess = require('chess.js');
import { uploadToS3, getFromS3 } from './../../Util';

export default async (params: { pgn: string; savePath: string }, context: {}) => {
    const { pgn, savePath } = params,
        instance = Chess(),
        size = 400;
    instance.load_pgn(pgn);
    const canvas = Canvas.createCanvas(size, size),
        ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.rect(0, 0, size, size);
    ctx.fillStyle = 'rgb(181, 136, 99)';
    ctx.fill();
    const ranks = 'abcdefgh';
    let i = 0;
    while (i < ranks.length) {
        let rank = ranks[i];
        for (let file = 1; file < 9; file++) {
            if ((i + +file) % 2 == 1) {
                ctx.beginPath();
                ctx.rect((size / 8) * i, (size / 8) * (8 - file), size / 8, size / 8);
                ctx.fillStyle = 'rgb(240, 217, 181)';
                ctx.fill();
            }
            const piece = instance.get(`${rank}${file}` as Square);

            if (!piece) continue;

            const piecekey = `${piece.color}${piece.type}.png`,
                pieceImg = (await getFromS3(`chess-pieces/${piecekey}`)) as Buffer,
                img = await Canvas.loadImage(pieceImg);

            const x = (size / 8) * i + size / (size / 2),
                y = (size / 8) * (8 - file) + size / (size / 2),
                w = size / 8 - size / (size / 4);

            ctx.drawImage(img, x, y, w, w);
        }
        i++;
    }

    const frame = new Frame(canvas, {
        image: {
            types: ['png'],
        },
    });

    return uploadToS3(frame.toBuffer(), `${savePath}.png`);
};
