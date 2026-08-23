// src/frontend/src/pages/HomePage.tsx
import InstallButton from "@/components/InstallButton";
import { CATEGORY_EMOJI } from "@/components/CategoryPill";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import FeedbackWall from "@/components/FeedbackWall";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { runUserGuide } from "@/lib/userGuide";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  Building2,
  ChevronRight,
  Facebook,
  FileText,
  Gift,
  Heart,
  Instagram,
  Linkedin,
  Mail,
  MailCheck,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import {
  getApprovedCases,
  getCategoryCounts,
  getKycStatus,
  getWallet,
  getUnlockCount,
  getUnreadNotificationsCount,
} from "@/lib/api";
