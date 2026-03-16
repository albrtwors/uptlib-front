export default function GenericModalContainer({ children }: any) {
    return <div className="fixed z-300000000 top-0 left-0 w-dvw h-dvh flex flex-col items-center justify-center bg-[#00000066]">

        <div className="rounded-lg bg-white lg:w-120 md:w-60 w-60 p-3">

            {children}


        </div>
    </div>

}