import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Authentification')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Inscription',
    description:
      'Crée un compte client (statut inactif) et envoie un code OTP par mail pour activer le compte.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Compte créé — OTP envoyé par mail.',
    schema: {
      example: {
        message: 'Compte créé. Vérifiez votre boîte mail pour activer votre compte.',
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email ou téléphone déjà utilisé.' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vérification OTP',
    description:
      'Vérifie le code OTP reçu par mail et active le compte. Redirige ensuite vers le login.',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiResponse({
    status: 200,
    description: 'Compte activé avec succès.',
    schema: {
      example: {
        message: 'Compte activé. Vous pouvez maintenant vous connecter.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Code OTP expiré ou déjà utilisé.' })
  @ApiResponse({ status: 404, description: 'Code OTP invalide.' })
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion',
    description:
      'Authentifie l\'utilisateur et retourne un JWT. Le rôle est inclus pour rediriger vers le bon espace.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie — JWT retourné.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        role: 'client',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Identifiants incorrects ou compte non activé.' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}