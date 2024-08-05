import { Injectable } from '@nestjs/common';

@Injectable()
export class ScholarService {
  async receiveData() {
    return 'Data received!';
  }
}
