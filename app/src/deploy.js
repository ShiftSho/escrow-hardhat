import { ethers } from 'ethers';
import Escrow from './artifacts/contracts/Escrow.sol/Escrow';

export default async function deploy(signer, arbiter, beneficiary, valueInEther) {
  const factory = new ethers.ContractFactory(
    Escrow.abi,
    Escrow.bytecode,
    signer
  );

  const valueInWei = ethers.utils.parseEther(valueInEther.toString());
  return factory.deploy(arbiter, beneficiary, { value: valueInWei });
}
