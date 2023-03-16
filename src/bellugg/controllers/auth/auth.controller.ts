import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from '../../services/auth/auth.service'
import { SignupDto } from '../../models/auth.dto'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // @Post('/signup')
    // signUp(@Body() body: SignupDto) {
    //     return this.authService.signup();
    // }
}
