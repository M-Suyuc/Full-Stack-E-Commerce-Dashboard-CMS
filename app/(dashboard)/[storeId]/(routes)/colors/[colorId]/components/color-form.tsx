'use client'

import * as z from 'zod'
import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'react-hot-toast'
import { Trash } from 'lucide-react'
import { Color } from '@prisma/client'
import { useParams, useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Heading } from '@/components/ui/heading'
import { AlertModal } from '@/components/modals/alert-modal'
import { Options, helpHttp } from '@/lib/helpHttp'

const formSchema = z.object({
  name: z.string().min(1),
  value: z
    .string()
    .min(4)
    .regex(/^#/, { message: 'String must be a valid hex code' })
})

type ColorFormValues = z.infer<typeof formSchema>

interface ColorFormProps {
  initialData: Color | null
}

export const ColorForm: React.FC<ColorFormProps> = ({ initialData }) => {
  const params = useParams()
  const router = useRouter()
  console.log(params)

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const title = initialData ? 'Edit color' : 'Create color'
  const description = initialData ? 'Edit a color.' : 'Add a new color'
  const toastMessage = initialData ? 'Color updated.' : 'Color created.'
  const action = initialData ? 'Save changes' : 'Create'

  const api = helpHttp()

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      value: ''
    }
  })

  const onSubmit = async (data: ColorFormValues) => {
    console.log(data)
    try {
      setLoading(true)

      let options: Options = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data
      }

      if (initialData) {
        await api.put(
          `/api/${params.storeId}/colors/${params.colorId}`,
          options
        )
      } else {
        await api.post(`/api/${params.storeId}/colors`, options)
      }
      router.refresh()
      setTimeout(() => {
        router.push(`/${params.storeId}/colors`)
      }, 1000)
      toast.success(toastMessage)
    } catch (error) {
      toast.error('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await api.del(`/api/${params.storeId}/colors/${params.colorId}`)

      router.refresh()
      router.push(`/${params.storeId}/colors`)
      toast.success('color deleted.')
    } catch (error: any) {
      toast.error('Make sure you removed all products using this color first.')
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        // onConfirm={() => {}}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className='flex items-center justify-between'>
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={loading}
            variant='destructive'
            color='sm'
            onClick={() => setOpen(true)}
          >
            <Trash className='h-4 w-4' />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form
          // onSubmit={form.handleSubmit(() => {})}
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 w-full'
        >
          <div className='md:grid md:grid-cols-3 gap-8'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder='Color name'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='value'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <div className='flex items-center gap-x-4'>
                      <Input
                        disabled={loading}
                        placeholder='Color value'
                        {...field}
                      />
                      <div
                        className='border p-4 rounded-full'
                        style={{ backgroundColor: field.value }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className='ml-auto' type='submit'>
            {action}
          </Button>
        </form>
      </Form>
    </>
  )
}
