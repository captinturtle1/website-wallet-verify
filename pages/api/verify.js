import { ethers } from 'ethers';
import AWS from 'aws-sdk';

const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

const provider = new ethers.providers.InfuraProvider("homestead", process.env.INFURA_API)
let nftContract = new ethers.Contract('0xc34cc9f3cf4e1f8dd3cde01bbe985003dcfc169f', abi, provider);

AWS.config.update({
  accessKeyId: process.env.aws_access_key_id,
  secretAccessKey: process.env.aws_secret_access_key,
  region: 'us-west-1'});
const ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
          let verifiedAddress = ethers.utils.verifyMessage(req.body.userId, req.body.signedHash);
          let params = {
            Item: {
             "userId": {S: `${req.body.userId}`}, 
             "address": {S: `${verifiedAddress}`},
             "signedHash": {S: `${req.body.signedHash}`}
            },
            TableName: "gurtsHolders"
          }
          let passBalance = await nftContract.balanceOf(verifiedAddress);
          console.log(passBalance.toString());
          if (passBalance.toString() > 0) {
            ddb.putItem(params, function(err, data) {
                if (err) {
                  console.log(err);
                } else {
                  console.log(`${req.body.userId} authorized`);
                }
            })
            res.status(200).json({ isHolder: true});
          } else {
            res.status(200).json({ isHolder: false});
          }
        } catch(err) {
          res.status(500).json('500 Internal Server Error');
        }
      } else {
        res.status(400).json('400 Bad Request');
      }
}