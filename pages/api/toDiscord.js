console.log('started');

export default function handler(req, res) {
    res.status(200).json({ name: 'John Doe' })
}