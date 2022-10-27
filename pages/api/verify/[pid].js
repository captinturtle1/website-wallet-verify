import { hashMessage } from '@ethersproject/hash';

export default function handler(req, res) {
    let { pid } = req.query
    let hashed = hashMessage(pid + 128)
    res.status(200).json({ hash: hashed })
}