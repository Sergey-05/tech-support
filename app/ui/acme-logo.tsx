import { GlobeAltIcon } from '@heroicons/react/24/outline';

export default function AcmeLogo() {
  return (
    <div
      className={`flex flex-row items-center leading-none text-white space-x-2`}
    >
      <GlobeAltIcon className="h-8 w-8 md:h-12 md:w-12 rotate-[15deg]" />
      <div className='flex flex-row md:flex-col space-x-2 md:space-x-0'>
        <p className="text-[24px] font-bold md:text-[22px]">КГТК</p>
        <p className="text-[24px] md:text-[20px]">Support</p>
      </div>
      
    </div>
  );
}
