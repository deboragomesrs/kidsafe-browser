CREATE POLICY "Users can update their own content"
ON public.allowed_content
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);