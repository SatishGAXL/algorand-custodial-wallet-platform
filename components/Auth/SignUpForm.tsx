"use client";
import { handleSignUp } from "@/actions/authFormActions";
import Link from "next/link";
import React from "react";
import { Checkbox } from "../ui/checkbox";
import { useRouter } from "next/navigation";
import { useToast } from "../ui/use-toast";
import { SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  username: string;
  password: string;
  canTransact: boolean;
};

const SignUpForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [checked, setChecked] = React.useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    const state = await handleSignUp(data.username, data.username, checked);
    if (state) {
      if (state.status) {
        toast({
          variant: "default",
          title: state.message,
        });
        router.prefetch("/");
        router.push("/");
      } else {
        toast({
          variant: "destructive",
          title: state.message,
        });
      }
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="mb-4">Please register your account</p>

      <div className="relative mb-4" data-twe-input-wrapper-init="">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Username
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("username")}
          type="text"
          placeholder="Username"
        />
      </div>

      <div className="relative mb-4" data-twe-input-wrapper-init="">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          {...register("password")}
          type="password"
          placeholder="Password"
        />
      </div>

      <div className="relative mb-4" data-twe-input-wrapper-init="">
        <input
          type="checkbox"
          id="canTransact"
          name="canTransact"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <label htmlFor="canTransact"> Enable Transaction</label>
      </div>

      <div className="mb-12 pb-1 pt-1 text-center">
        <button
          className="mb-3 inline-block w-full rounded px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-dark-3 transition duration-150 ease-in-out hover:shadow-dark-2 focus:shadow-dark-2 focus:outline-none focus:ring-0 active:shadow-dark-2 "
          type="submit"
          data-twe-ripple-init=""
          data-twe-ripple-color="light"
          style={{
            background:
              "linear-gradient(to right, #ee7724, #d8363a, #dd3675, #b44593)",
          }}
        >
          Register
        </button>
      </div>
      {/*Register button*/}
      <div className="flex items-center justify-between pb-6">
        <p className="mb-0 me-2">Already have an account?</p>
        <Link
          href={"/signin"}
          type="button"
          className="inline-block rounded border-2 border-danger px-6 pb-[6px] pt-2 text-xs font-medium uppercase leading-normal text-danger transition duration-150 ease-in-out hover:border-danger-600 hover:bg-danger-50/50 hover:text-danger-600 focus:border-danger-600 focus:bg-danger-50/50 focus:text-danger-600 focus:outline-none focus:ring-0 active:border-danger-700 active:text-danger-700 "
          data-twe-ripple-init=""
          data-twe-ripple-color="light"
        >
          Log in
        </Link>
      </div>
    </form>
  );
};

export default SignUpForm;
