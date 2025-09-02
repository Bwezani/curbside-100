
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { signUpWithEmail, signInWithGoogle } from "@/firebase/auth";
import { createUserProfile } from "@/firebase/user";
import { getAdditionalUserInfo } from "firebase/auth";
import { User, GraduationCap, ArrowLeft } from "lucide-react";
import dynamic from 'next/dynamic';
// import 'leaflet/dist/leaflet.css';

const LocationPicker = dynamic(() => import('@/components/LocationPicker').then(mod => mod.LocationPicker), { ssr: false, loading: () => <p>Loading map...</p> });

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12.027s5.56 12.027 12.173 12.027c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.133H12.48z"
            fill="currentColor"
        />
    </svg>
);


const baseSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  firstName: z.string().min(2, "First name must be at least 2 characters."),
  lastName: z.string().min(2, "Last name must be at least 2 characters."),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
});

const studentSchema = baseSchema.extend({
  userType: z.literal('student'),
  university: z.string().min(1, "Please select your university."),
  hostel: z.string().min(1, "Hostel is required."),
  block: z.string().min(1, "Block is required."),
  room: z.string().min(1, "Room number is required."),
  address: z.string().optional(),
  landmark: z.string().optional(),
  township: z.string().optional(),
  city: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

const nonStudentSchema = baseSchema.extend({
  userType: z.literal('non-student'),
  address: z.string().min(5, "Please enter a valid address."),
  landmark: z.string().optional(),
  township: z.string().optional(),
  city: z.string().default('Lusaka'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  university: z.string().optional(),
  hostel: z.string().optional(),
  block: z.string().optional(),
  room: z.string().optional(),
});

const signUpSchema = z.discriminatedUnion("userType", [studentSchema, nonStudentSchema]);

type SignUpFormValues = z.infer<typeof signUpSchema>;

const universities = [
    "University of Zambia (UNZA)",
    "Apex Medical University",
    "University of Lusaka (UNILUS)",
    "Levy Mwanawasa Medical University",
    "National Institute of Public Administration (NIPA)",
    "ZCAS University",
    "Other"
];

export default function SignUpPage() {
  const [userType, setUserType] = useState<'student' | 'non-student' | null>(null);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      address: "",
      city: "Lusaka",
    },
  });

  const locationPicked = !!form.watch('latitude') && !!form.watch('longitude');
  
  const handleNextStep = async () => {
    const fieldsToValidate: (keyof SignUpFormValues)[] = ['firstName', 'lastName', 'email', 'password', 'phoneNumber'];
    const isValid = await form.trigger(fieldsToValidate);
    if(isValid) {
        setStep(2);
    }
  }

  const handleSignUp = async (data: SignUpFormValues) => {
    setIsLoading(true);
    try {
      const userCredential = await signUpWithEmail(data.email, data.password);
      const user = userCredential.user;

      if (user) {
        const profileData = {
          email: data.email,
          username: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          userType: data.userType,
          address: data.address || '',
          university: data.university || '',
          hostel: data.hostel || '',
          block: data.block || '',
          room: data.room || '',
          landmark: data.landmark || '',
          township: data.township || '',
          city: data.city || 'Lusaka',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        };
        
        await createUserProfile(user.uid, profileData);

        toast({
          title: "Account Created!",
          description: "Welcome! Your account has been successfully created.",
        });
        router.push("/shop");
      }
    } catch (error: any) {
      toast({
        title: "Sign-up failed",
        description: error.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' : error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      const additionalUserInfo = getAdditionalUserInfo(result);
      
      if (additionalUserInfo?.isNewUser) {
        router.push("/complete-profile");
      } else {
        router.push("/shop");
      }
    } catch (error: any) {
      toast({
        title: "Google Sign-in failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };
  
  const handleUserTypeSelect = (type: 'student' | 'non-student') => {
    setUserType(type);
    form.setValue('userType', type);
  };

  const renderStudentFields = () => (
    <>
      <FormField
        control={form.control}
        name="university"
        render={({ field }) => (
          <FormItem>
            <FormLabel>University</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                </FormControl>
                <SelectContent>
                    {universities.map(uni => <SelectItem key={uni} value={uni}>{uni}</SelectItem>)}
                </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="hostel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hostel / Boarding Location</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Kwacha / 15 Miles" {...field}  disabled={isLoading || isGoogleLoading}/>
            </FormControl>
            <FormDescription>If not in a campus hostel, enter your boarding area.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="block"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Block</FormLabel>
              <FormControl>
                <Input placeholder="e.g., A" {...field}  disabled={isLoading || isGoogleLoading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Number</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 101" {...field}  disabled={isLoading || isGoogleLoading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
  
  const renderNonStudentFields = () => (
    <>
      {step === 1 && (
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Jane" {...field} disabled={isLoading || isGoogleLoading}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Doe" {...field} disabled={isLoading || isGoogleLoading}/></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="m@example.com" {...field} disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" {...field}  disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="e.g., 09xxxxxxxx" {...field}  disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>
      )}
      {step === 2 && (
        <div>
           <LocationPicker form={form} />
        </div>
      )}
    </>
  );
  
  const renderStudentForm = () => (
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Jane" {...field} disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Doe" {...field} disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
            <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} disabled={isLoading || isGoogleLoading}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" {...field}  disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl><Input type="tel" placeholder="e.g., 09xxxxxxxx" {...field}  disabled={isLoading || isGoogleLoading}/></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {renderStudentFields()}
      </div>
  );
  
   if (!userType) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
            <Card className="w-full max-w-md">
                 <CardHeader>
                    <CardTitle className="text-2xl text-center">Join Curbside.</CardTitle>
                    <CardDescription className="text-center">
                        To get started, please tell us who you are.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                     <Button size="lg" className="h-16 text-lg" onClick={() => handleUserTypeSelect('student')}>
                        <GraduationCap className="mr-3 h-6 w-6"/>
                        I am a Student
                     </Button>
                      <Button size="lg" variant="secondary" className="h-16 text-lg" onClick={() => handleUserTypeSelect('non-student')}>
                        <User className="mr-3 h-6 w-6"/>
                        I am not a Student
                     </Button>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/auth/signin" className="underline underline-offset-4 hover:text-primary">
                            Sign in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
   }


  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg my-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            {userType === 'non-student' && step === 2 ? (
                <button onClick={() => setStep(1)} className="flex items-center gap-2 hover:text-primary transition-colors">
                    <ArrowLeft className="h-6 w-6"/>
                    <span>Delivery Information</span>
                </button>
            ) : "Create Your Account" }
          </CardTitle>
          <CardDescription>
            You're signing up as a {userType}. <Button variant="link" className="p-0 h-auto" onClick={() => {setUserType(null); setStep(1);}}>Not right?</Button>
            {userType === 'non-student' && <span className="ml-2 text-xs font-semibold">(Step {step} of 2)</span>}
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSignUp)}>
            <CardContent>
                {userType === 'student' ? renderStudentForm() : renderNonStudentFields()}
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              {userType === 'non-student' && step === 1 && (
                 <Button type="button" className="w-full" onClick={handleNextStep}>
                    Next
                 </Button>
              )}

              {(userType === 'student' || step === 2) && (
                  <Button type="submit" className="w-full" disabled={isLoading || isGoogleLoading || (userType === 'non-student' && !locationPicked)}>
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
              )}

               <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading || isGoogleLoading}
                type="button"
              >
                <GoogleIcon className="mr-2 h-4 w-4" />
                {isGoogleLoading ? 'Signing Up...' : 'Sign Up with Google'}
              </Button>
            </CardFooter>
          </form>
        </Form>
        <p className="text-center text-sm text-muted-foreground pb-6">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
