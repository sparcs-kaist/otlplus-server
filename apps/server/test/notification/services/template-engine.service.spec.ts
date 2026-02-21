import { Test, TestingModule } from '@nestjs/testing'
import { TemplateEngineService } from '@otl/server-nest/modules/notification/services/template-engine.service'
import logger from '@otl/common/logger/logger'

jest.mock('@otl/common/logger/logger', () => ({
  warn: jest.fn(),
  info: jest.fn(),
  error: jest.fn(),
}))

describe('TemplateEngineService', () => {
  let service: TemplateEngineService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemplateEngineService],
    }).compile()

    service = module.get<TemplateEngineService>(TemplateEngineService)
    jest.clearAllMocks()
  })

  describe('render', () => {
    it('should render simple template with single variable', () => {
      const template = 'Hello, {{name}}!'
      const variables = { name: 'Alice' }

      const result = service.render(template, variables)

      expect(result).toBe('Hello, Alice!')
    })

    it('should render template with multiple variables', () => {
      const template = 'Welcome {{name}}, you have {{count}} new messages'
      const variables = { name: 'Bob', count: '5' }

      const result = service.render(template, variables)

      expect(result).toBe('Welcome Bob, you have 5 new messages')
    })

    it('should handle missing variables by rendering as empty string', () => {
      const template = 'Hello, {{name}}! Your score is {{score}}'
      const variables = { name: 'Charlie' }

      const result = service.render(template, variables)

      expect(result).toBe('Hello, Charlie! Your score is ')
      expect(logger.warn).toHaveBeenCalledWith('[TemplateEngine] Unresolved variable: {{score}}')
    })

    it('should handle template without variables', () => {
      const template = 'This is a static message'
      const variables = {}

      const result = service.render(template, variables)

      expect(result).toBe('This is a static message')
    })

    it('should handle special characters in variables', () => {
      const template = 'Message: {{text}}'
      const variables = { text: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/' }

      const result = service.render(template, variables)

      expect(result).toBe('Message: Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?/')
    })

    it('should handle numeric values in variables', () => {
      const template = 'Price: {{price}}, Quantity: {{qty}}'
      const variables = { price: '29.99', qty: '10' }

      const result = service.render(template, variables)

      expect(result).toBe('Price: 29.99, Quantity: 10')
    })

    it('should handle same variable used multiple times', () => {
      const template = '{{name}} said: "{{name}} is the best!"'
      const variables = { name: 'Alice' }

      const result = service.render(template, variables)

      expect(result).toBe('Alice said: "Alice is the best!"')
    })

    it('should handle nested placeholders gracefully (renders outer only)', () => {
      const template = 'Value: {{outer}}'
      const variables = { outer: '{{inner}}', inner: 'nested' }

      const result = service.render(template, variables)

      // Should replace {{outer}} with its value "{{inner}}", not recursively resolve
      expect(result).toBe('Value: {{inner}}')
    })

    it('should handle empty variable values', () => {
      const template = 'Start{{empty}}End'
      const variables = { empty: '' }

      const result = service.render(template, variables)

      expect(result).toBe('StartEnd')
    })

    it('should handle variables with underscores and numbers', () => {
      const template = '{{user_name_123}} has {{item_count_2}}'
      const variables = { user_name_123: 'TestUser', item_count_2: '42' }

      const result = service.render(template, variables)

      expect(result).toBe('TestUser has 42')
    })

    it('should log warning for each unresolved variable', () => {
      const template = 'Missing: {{var1}}, {{var2}}, {{var3}}'
      const variables = {}

      service.render(template, variables)

      expect(logger.warn).toHaveBeenCalledTimes(3)
      expect(logger.warn).toHaveBeenCalledWith('[TemplateEngine] Unresolved variable: {{var1}}')
      expect(logger.warn).toHaveBeenCalledWith('[TemplateEngine] Unresolved variable: {{var2}}')
      expect(logger.warn).toHaveBeenCalledWith('[TemplateEngine] Unresolved variable: {{var3}}')
    })

    it('should not log warnings for resolved variables', () => {
      const template = '{{name}} - {{value}}'
      const variables = { name: 'Test', value: '123' }

      service.render(template, variables)

      expect(logger.warn).not.toHaveBeenCalled()
    })
  })
})
