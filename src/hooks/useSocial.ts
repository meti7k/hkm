import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SocialService, UserService } from '../services/api';
import { useToast } from '../context/ToastContext';

export const useFriendsList = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['friends', 'list'],
    queryFn: () => SocialService.getFriends(100, 0, 'friends'),
    staleTime: 1000 * 60 * 5,
    enabled,
  });
};

export const useFriendRequests = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['friends', 'incoming'],
    queryFn: () => SocialService.getFriends(50, 0, 'incoming'),
    staleTime: 1000 * 60,
    enabled,
  });
};

export const useOutgoingRequests = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['friends', 'outgoing'],
    queryFn: () => SocialService.getFriends(100, 0, 'outgoing'),
    staleTime: 1000 * 60,
    enabled,
  });
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => UserService.search(query),
    enabled: query.length >= 4,
    staleTime: 1000 * 60,
  });
};

export const useSocialActions = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const sendRequest = useMutation({
    mutationFn: (userId: number) => SocialService.sendRequest(userId),
    onSuccess: () => {
      showToast('درخواست دوستی ارسال شد', 'success');
      queryClient.invalidateQueries({ queryKey: ['friends', 'outgoing'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
    onError: (err: any) => {
      if (err.response?.status === 409) {
        showToast('شما قبلاً به این کاربر درخواست داده‌اید', 'info');
      } else {
        showToast('خطا در ارسال درخواست', 'error');
      }
    }
  });

  const acceptRequest = useMutation({
    mutationFn: (friendshipId: number) => SocialService.acceptRequest(friendshipId),
    onSuccess: () => {
      showToast('درخواست دوستی پذیرفته شد', 'success');
      queryClient.invalidateQueries({ queryKey: ['friends', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['friends', 'list'] });
    },
    onError: () => {
      showToast('خطا در پذیرش درخواست', 'error');
    }
  });

  const rejectRequest = useMutation({
    mutationFn: (friendshipId: number) => SocialService.rejectRequest(friendshipId),
    onSuccess: () => {
      showToast('درخواست دوستی رد شد', 'info');
      queryClient.invalidateQueries({ queryKey: ['friends', 'incoming'] });
    },
    onError: () => {
      showToast('خطا در رد درخواست', 'error');
    }
  });

  const removeFriend = useMutation({
    mutationFn: (userId: number) => SocialService.removeFriend(userId),
    onSuccess: () => {
      showToast('کاربر از لیست دوستان حذف شد', 'info');
      queryClient.invalidateQueries({ queryKey: ['friends', 'list'] });
    },
    onError: () => {
      showToast('خطا در حذف دوست', 'error');
    }
  });

  const blockUser = useMutation({
    mutationFn: (userId: number) => SocialService.blockUser(userId),
    onSuccess: () => {
      showToast('کاربر مسدود شد', 'info');
      queryClient.invalidateQueries({ queryKey: ['friends', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['friends', 'incoming'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'blocked'] });
    },
    onError: () => {
      showToast('خطا در مسدود کردن کاربر', 'error');
    }
  });

  return {
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    blockUser
  };
};
