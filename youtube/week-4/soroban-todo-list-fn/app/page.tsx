import { Header } from "@/components/header"
import { TodoList } from "@/components/todo-list"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-2 text-balance">
              Task Management on Stellar
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto text-pretty">
              A decentralized todo application powered by Soroban smart contracts. 
              Your tasks, stored on-chain.
            </p>
          </div>
          
          <TodoList />
        </div>
      </main>

      <footer className="border-t border-border/50 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>Built with Soroban SDK</span>
          <span>Stellar Network</span>
        </div>
      </footer>
    </div>
  )
}
