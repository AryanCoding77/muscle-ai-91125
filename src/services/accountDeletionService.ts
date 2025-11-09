// Account Deletion Service for handling account deletion requests

import { supabase } from '../lib/supabase';

export interface AccountDeletionRequest {
  id: string;
  user_id: string;
  email: string;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface CreateDeletionRequestParams {
  reason: string;
}

/**
 * Submit an account deletion request
 */
export const submitAccountDeletionRequest = async (
  params: CreateDeletionRequestParams
): Promise<{ success: boolean; message: string; request?: AccountDeletionRequest }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Check if user already has a pending request
    const { data: existingRequests, error: checkError } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine
      console.error('❌ Error checking existing requests:', checkError);
    }

    if (existingRequests) {
      return {
        success: false,
        message: 'You already have a pending deletion request. Please wait for our response.',
      };
    }

    // Create the deletion request
    const { data, error } = await supabase
      .from('account_deletion_requests')
      .insert([
        {
          user_id: user.id,
          email: user.email,
          reason: params.reason,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating deletion request:', error);
      throw error;
    }

    console.log('✅ Account deletion request submitted:', data);

    return {
      success: true,
      message: 'Your deletion request has been submitted successfully. We will contact you via email shortly.',
      request: data,
    };
  } catch (error) {
    console.error('❌ Error in submitAccountDeletionRequest:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit deletion request. Please try again.',
    };
  }
};

/**
 * Get user's deletion requests
 */
export const getUserDeletionRequests = async (): Promise<AccountDeletionRequest[]> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching deletion requests:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error in getUserDeletionRequests:', error);
    return [];
  }
};

/**
 * Check if user has a pending deletion request
 */
export const hasPendingDeletionRequest = async (): Promise<boolean> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return false;
    }

    const { data, error } = await supabase
      .from('account_deletion_requests')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking pending requests:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('❌ Error in hasPendingDeletionRequest:', error);
    return false;
  }
};
