
"use client";

import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/use-auth";
import { createUserProfile } from "@/firebase/user";
import { LoaderCircle, GraduationCap, User as UserIcon } from "lucide-react";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';


const LocationPicker = dynamic(() => import('@/components/LocationPicker').then(mod => mod.LocationPicker), { ssr: false, loading: () => <p>Loading map...</p> });

const baseSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  phoneNumber: z.string().min(10, "Please enter a valid phone number."),
});

const studentSchema = baseSchema.extend({
  userType: z.literal('student'),
  university: z.string().min(1, "Please select your university."),
  hostel: z.string().min(1, "Hostel is required."),
  block: z.string().optional(),
  room: z.string().optional(),
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
  township: z.string().min(1, "Please select a township."),
  city: z.string().default('Lusaka'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  university: z.string().optional(),
  hostel: z.string().optional(),
  block: z.string().optional(),
  room: z.string().optional(),
});

const profileSchema = z.discriminatedUnion("userType", [studentSchema, nonStudentSchema]);


type ProfileFormValues = z.infer<typeof profileSchema>;

const universities = [
    "University of Zambia (UNZA)",
    "Apex Medical University",
    "University of Lusaka (UNILUS)",
    "Levy Mwanawasa Medical University",
    "National Institute of Public Administration (NIPA)",
    "ZCAS University",
    "Other"
];

export default function CompleteProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'non-student' | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.displayName?.split(' ')[0] || "",
      lastName: user?.displayName?.split(' ').slice(1).join(' ') || "",
      phoneNumber: "",
      address: "",
      city: "Lusaka",
    },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth/signin");
    }
     if (user?.displayName) {
        form.setValue("firstName", user.displayName.split(' ')[0] || "");
        form.setValue("lastName", user.displayName.split(' ').slice(1).join(' ') || "");
    }
  }, [user, authLoading, router, form]);


  const onSubmit = async (data: ProfileFormValues) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive"});
        return;
    }

    setIsLoading(true);
    try {
        await createUserProfile(user.uid, {
          email: user.email!,
          username: `${data.firstName} ${data.lastName}`,
          firstName: data.firstName,
          lastName: data.lastName,
          phoneNumber: data.phoneNumber,
          userType: data.userType,
          university: data.university || '',
          hostel: data.hostel || '',
          block: data.block || '',
          room: data.room || '',
          address: data.address || '',
          landmark: data.landmark || '',
          township: data.township || '',
          city: data.city || 'Lusaka',
          latitude: data.latitude || null,
          longitude: data.longitude || null,
        });

        toast({
            title: "Profile Complete!",
            description: "Welcome! Your profile has been successfully created.",
        });

        router.push("/shop");

    } catch(error: any) {
        toast({
            title: "Update Failed",
            description: error.message || "Could not update your profile. Please try again.",
            variant: "destructive",
        })
    } finally {
        setIsLoading(false);
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
              <Input placeholder="e.g., Kwacha / 15 Miles" {...field} />
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
                <Input placeholder="e.g., A (Optional)" {...field} />
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
                <Input placeholder="e.g., 101 (Optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
  
  const renderNonStudentFields = () => (
     <LocationPicker form={form} />
  );


  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!userType) {
     return (
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
            <Card className="w-full max-w-md">
                 <CardHeader>
                    <CardTitle className="text-2xl text-center">One Last Step!</CardTitle>
                    <CardDescription className="text-center">
                        To complete your profile, please tell us who you are.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                     <Button size="lg" className="h-16 text-lg" onClick={() => handleUserTypeSelect('student')}>
                        <GraduationCap className="mr-3 h-6 w-6"/>
                        I am a Student
                     </Button>
                      <Button size="lg" variant="secondary" className="h-16 text-lg" onClick={() => handleUserTypeSelect('non-student')}>
                        <UserIcon className="mr-3 h-6 w-6"/>
                        I am not a Student
                     </Button>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            You're signing up as a {userType}. Your email is {user.email}. <Button variant="link" className="p-0 h-auto" onClick={() => setUserType(null)}>Change</Button>
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Jane" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="e.g., Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="e.g., 09xxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {userType === 'student' ? renderStudentFields() : renderNonStudentFields()}

            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                ) : "Save and Continue"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}

    