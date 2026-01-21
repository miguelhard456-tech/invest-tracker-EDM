import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Phone, Lock, Camera, Save } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const UserProfile = () => {
  const { getAuthHeaders, user: authUser } = useAuth();
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/user/profile`, {
        headers: getAuthHeaders()
      });
      setUser(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setPhone(response.data.phone || '');
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'en' ? 'File size must be less than 5MB' : 'O tamanho do arquivo deve ser menor que 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await axios.post(`${API}/user/profile-photo`, formData, {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(prev => ({ ...prev, profile_photo: response.data.photo_url }));
      toast.success(language === 'en' ? 'Photo uploaded!' : 'Foto enviada!');
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to upload photo' : 'Falha ao enviar foto');
    }
  };

  const handleSaveProfile = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'As senhas não coincidem');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name,
        email,
        phone
      };

      if (newPassword) {
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
      }

      const response = await axios.put(`${API}/user/profile`, updateData, {
        headers: getAuthHeaders()
      });

      setUser(response.data);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      toast.success(language === 'en' ? 'Profile updated!' : 'Perfil atualizado!');
    } catch (error) {
      toast.error(error.response?.data?.detail || (language === 'en' ? 'Failed to update profile' : 'Falha ao atualizar perfil'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-heading font-bold mb-8">
            {language === 'en' ? 'User Profile' : 'Perfil do Usuário'}
          </h1>

          <div className="space-y-6">
            {/* Profile Photo */}
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">
                {language === 'en' ? 'Profile Photo' : 'Foto de Perfil'}
              </h2>
              
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user.profile_photo ? (
                    <img
                      src={user.profile_photo}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-primary">
                      <UserIcon className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    data-testid="photo-upload-input"
                  />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'en' ? 'Member since' : 'Membro desde'}: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>

            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">
                {language === 'en' ? 'Personal Information' : 'Informações Pessoais'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">
                    <UserIcon className="w-4 h-4 inline mr-2" />
                    {t('name')}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="profile-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    <Mail className="w-4 h-4 inline mr-2" />
                    {t('email')}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="profile-email-input"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">
                    <Phone className="w-4 h-4 inline mr-2" />
                    {language === 'en' ? 'Phone Number' : 'Número de Telefone'}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    data-testid="profile-phone-input"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'en' 
                      ? 'Include country code (e.g., +55 for Brazil)'
                      : 'Inclua o código do país (ex: +55 para Brasil)'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <h2 className="text-xl font-heading font-semibold mb-4">
                <Lock className="w-5 h-5 inline mr-2" />
                {language === 'en' ? 'Change Password' : 'Alterar Senha'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">
                    {language === 'en' ? 'Current Password' : 'Senha Atual'}
                  </Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    data-testid="current-password-input"
                  />
                </div>

                <div>
                  <Label htmlFor="new-password">
                    {language === 'en' ? 'New Password' : 'Nova Senha'}
                  </Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    data-testid="new-password-input"
                  />
                </div>

                <div>
                  <Label htmlFor="confirm-password">
                    {language === 'en' ? 'Confirm New Password' : 'Confirmar Nova Senha'}
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    data-testid="confirm-password-input"
                  />
                </div>
              </div>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="btn-primary gap-2"
                data-testid="save-profile-btn"
              >
                <Save className="w-4 h-4" />
                {saving ? t('loading') : t('save')}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfile;
